# GrowthMCP — End-to-End Live Mode Architecture

This document describes the production architecture connecting the **GrowthMCP Analytics Dashboard** to the **GrowthMCP Model Context Protocol (MCP) Server** and live **Meta Ads (Facebook & Instagram Graph API)**, while preserving the deterministic **Demo Mode** as the safe, zero-dependency default.

---

## 1. High-Level System Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (BROWSER / GITHUB PAGES)              │
│                                                                        │
│   ┌────────────────────┐            ┌─────────────────────────────┐   │
│   │    Dashboard UI    │            │     useAnalytics() Hook     │   │
│   │  (Overview, Table, │ ─────────> │   (State & Mode Switcher)   │   │
│   │   Analyst, System) │            └──────────────┬──────────────┘   │
│   └────────────────────┘                           │                   │
│                                       ┌────────────┴───────────┐       │
│                                       │ Mode = 'demo' | 'live' │       │
│                                       └─────┬────────────┬─────┘       │
│                                             │            │             │
│                       ┌─────────────────────┘            └──────────┐  │
│                       ▼                                             ▼  │
│   ┌─────────────────────────────────────┐     ┌──────────────────────┐ │
│   │        DemoAnalyticsProvider        │     │  GrowthMCPProvider   │ │
│   │ (Deterministic in-memory dataset,   │     │ (Streamable HTTP     │ │
│   │  instant, zero external calls)      │     │  MCP JSON-RPC 2.0)   │ │
│   └─────────────────────────────────────┘     └──────────┬───────────┘ │
└──────────────────────────────────────────────────────────┼─────────────┘
                                                           │ POST /mcp (JSON-RPC + SSE)
                                                           │ Header: mcp-session-id
                                                           ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   OPERATOR ENVIRONMENT (LOCAL / PRIVATE HOST)         │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ GrowthMCP Server (FastMCP Transport: streamable-http, :8080)   │   │
│   │                                                                │   │
│   │  ├── Starlette CORSMiddleware (Expose: mcp-session-id)         │   │
│   │  ├── AuthContext / Server-Side Token Injection                 │   │
│   │  ├── FastMCP Session Manager                                   │   │
│   │  └── 12 Registered MCP Tools:                                  │   │
│   │       • get_ad_accounts                                        │   │
│   │       • get_campaigns                                          │   │
│   │       • get_insights                                           │   │
│   │       • calculate_growth_metrics                               │   │
│   │       • investigate_live_meta_growth_issue                     │   │
│   │       • analyze_growth_query                                   │   │
│   │       • build_evidence_packet                                  │   │
│   │       • ...                                                    │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│          Bearer META_ACCESS_TOKEN │ (Secure Server-Side Auth)          │
│                                   ▼                                    │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Meta Graph API v24.0 (graph.facebook.com)                      │   │
│   │ Ad Accounts, Campaigns, Insights, Ad Sets, Creatives           │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Security & Zero Credential Exposure Guarantee

A core security invariant of GrowthMCP is **zero credential exposure to the client**:

1. **No Tokens in Client State**: Under no circumstances does the frontend browser ever request, store, or transmit Meta API tokens (`META_ACCESS_TOKEN`, app secrets, system user tokens).
2. **Server-Side Token Isolation**: All Meta Graph API authentication is executed exclusively by GrowthMCP inside the operator's controlled Python process. Tokens are loaded from environment variables (`META_ACCESS_TOKEN`) or the secure local OAuth cache (`~/.config/growthmcp/token_cache.json`).
3. **Restricted Cross-Origin Permissions**: GrowthMCP's Streamable HTTP transport enables CORS for authorized dashboard origins, exposing only standard protocol headers (`mcp-session-id`) without revealing server-side configuration.
4. **Graceful Degraded Fallback**: If the local server is stopped, offline, or returns an error, the dashboard displays a clear status and provides an immediate 1-click fallback to the deterministic Demo Mode.

---

## 3. Protocol Wire Specification (Streamable HTTP)

Communication between the frontend dashboard and GrowthMCP follows the official **Model Context Protocol (MCP)** specification:

### A. Handshake (`initialize`)
The client initiates a session with a POST request to `/mcp`:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": {
      "name": "growthmcp-dashboard",
      "version": "1.0.0"
    }
  }
}
```
**Response (HTTP 200)**:
- Header: `mcp-session-id: <session-token>`
- Body (SSE Event):
```
event: message
data: {"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2024-11-05","capabilities":{...},"serverInfo":{"name":"growthmcp","version":"0.1.0"}}}
```

### B. Notification (`notifications/initialized`)
The client confirms session establishment:
```json
{
  "jsonrpc": "2.0",
  "method": "notifications/initialized"
}
```
**Response**: HTTP 202 Accepted.

### C. Tool Invocation (`tools/call`)
Subsequent requests include the `mcp-session-id` header:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_campaigns",
    "arguments": {
      "account_id": "act_1234567890"
    }
  }
}
```
**Response**:
```
event: message
data: {"jsonrpc":"2.0","id":2,"result":{"content":[{"type":"text","text":"[...]"}]}}
```

---

## 4. Normalization and Truthful Empty States

When live Meta campaigns and insights are returned:
1. **Canonical Schema Alignment**: Raw Meta objects (where spend, impressions, and clicks are strings, and conversions/leads are in `actions` arrays) are mapped to canonical `CampaignItem` interfaces matching GrowthMCP's mathematical definitions.
2. **Deterministic Calculations**: Derived rates (CTR, CPC, CPA, CPL, CVR, ROAS) are calculated using `deriveMetricsFromTotals()` from additive totals, eliminating rounding errors.
3. **Empty Ad Accounts**: If a connected Meta ad account has 0 running campaigns or no spend, the dashboard displays a clear, truthful empty state:
   > *"No active campaigns found in Meta ad account act_xxx. Try selecting another account or switch to Demo Mode."*
   The system never fabricates synthetic data in Live Mode.

---

## 5. Operator Quickstart: Running in Live Mode

### Step 1: Start GrowthMCP Server Locally
In your backend repository (`~/ai-growth-analytics-mcp`):
```bash
# Configure your Meta access token in your environment
export META_ACCESS_TOKEN="EAA..."

# Start GrowthMCP over Streamable HTTP on port 8080
python3 -m growthmcp --transport streamable-http --port 8080 --host 127.0.0.1
```

### Step 2: Open Dashboard
1. Open the GrowthMCP Dashboard in your browser (locally on `http://localhost:5173` or live on GitHub Pages).
2. Click the **DEMO MODE** badge in the header, or navigate to **System** view and click **Switch to Live Mode**.
3. The dashboard connects to `http://127.0.0.1:8080/mcp`, establishes an MCP session, and streams live campaigns, ad accounts, and analytics directly from Meta Ads!
