# GrowthMCP Dashboard

**Enterprise Growth Analytics frontend for GrowthMCP.**

GrowthMCP Dashboard is a high-density, client-side analytics web console built to demonstrate and interact with [GrowthMCP](https://github.com/Lokeshwar2005/ai-growth-analytics-mcp) — the self-hosted Model Context Protocol (MCP) server for growth marketing intelligence and Meta Ads investigation.

## 📖 About GrowthMCP Dashboard

GrowthMCP Dashboard is an enterprise-grade, high-density growth marketing analytics web console built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Vite**. It provides growth marketing teams, performance marketers, and executive operators with a unified view of unit economics (ROAS, CPA, CPL, CTR, CPC, CVR), conversion funnels, creative asset fatigue, cohort retention decay, and deterministic root-cause investigation.

It features a dual-mode architecture:
- **Demo Mode (Default)**: Verified, deterministic multi-channel dataset running client-side with zero external setup.
- **Live Mode**: End-to-end connection over Streamable HTTP (`/mcp`) to a self-hosted [GrowthMCP](https://github.com/Lokeshwar2005/ai-growth-analytics-mcp) server and live Meta Ads.

👉 **[Open Live GrowthMCP Analytics Dashboard](https://lokeshwar2005.github.io/growthmcp-dashboard/)**

---

## 🚀 Live Demo

- **Live URL**: https://lokeshwar2005.github.io/growthmcp-dashboard/
- **Backend MCP Server**: https://github.com/Lokeshwar2005/ai-growth-analytics-mcp
- **Deployment**: GitHub Pages via automated GitHub Actions CI/CD

> **Architecture Guarantee**: The dashboard is a client-side frontend. GrowthMCP itself runs separately as an independent, self-hosted MCP server via stdio or Streamable HTTP. The dashboard never requests, stores, or handles sensitive Meta API access tokens.

---

## 📊 Key Features

- **Growth Overview**: High-level executive KPI cards (Spend, Revenue, ROAS, Leads, Conversions, CPL, CTR, CVR) with period comparisons and trajectory charts.
- **Campaign Analytics**: Dense enterprise table featuring multi-channel normalization (Meta Ads, Google Ads, TikTok Ads), sorting, searching, status badges, and ad set drill-down modals.
- **Full-Funnel Acquisition**: Drop-off conversion waterfall tracking unit economics (CAC, CPA, CPC, CPL) from Top-of-Funnel impressions down to customer purchases.
- **Creative Diagnostics**: Asset-level fatigue detection, CTR degradation alerts, and performance change tracking across Video, Reels, Carousels, and Statics.
- **Cohort Retention Heatmap**: Month-level acquisition cohort decay matrices tracking customer retention rates and cumulative lifetime value (LTV).
- **Revenue Contribution**: Gross customer revenue flow modeling (Spend → Conversions → Revenue) and platform attribution breakdowns.
- **Growth Issue Investigation**: Deterministic mathematical driver decomposition answering *"Why did ROAS drop?"* or *"Why did CPL increase?"* with component deltas and campaign contribution rankings.
- **AI Growth Analyst**: Natural language query console executing deterministic analytics over marketing records without external LLM hallucinations.
- **Data Source Control**: Connection monitoring for Meta Ads, Google Ads, TikTok, GA4, and manual CSV imports.
- **System & MCP Telemetry**: Interactive FastMCP architecture monitor listing all 12 registered GrowthMCP tools and Streamable HTTP endpoint configuration.

---

## 🏗️ Architecture

```
GitHub Pages (Static Client)
    │
    ├── Demo Mode (Default): Runs deterministic GrowthMCP analytics engine client-side
    │
    └── Live Mode: Connects via Streamable HTTP (JSON-RPC) to operator-hosted GrowthMCP
            │
            ▼
GrowthMCP Server (Self-Hosted Python FastMCP)
    │
    ├── stdio / Streamable HTTP transports
    ├── Meta Graph API v21.0 integration
    └── Deterministic Growth Analyst & Investigation Engine
```

### Security Architecture

- **Zero Credentials in Frontend**: No `META_ACCESS_TOKEN`, app secrets, or OAuth refresh tokens exist in this repository or build artifacts.
- **Safe Environment Variables**: Only public configuration endpoints (e.g. `VITE_GROWTHMCP_ENDPOINT`) are supported.

---

## 🧪 Demo Mode vs. Live Mode

1. **Demo Mode (Active by default)**:
   - Operates on a realistic, deterministic dataset representing a \$150k/mo multi-channel direct-to-consumer brand.
   - Calculations and investigations execute identical algorithms to GrowthMCP's Python implementation.
   - Zero external backend dependencies needed.

2. **Live Mode**:
   - Point the dashboard to your self-hosted GrowthMCP Streamable HTTP server via the **System / MCP** tab or `VITE_GROWTHMCP_ENDPOINT`.
   - All Meta API calls remain strictly on your server.

---

## 💻 Tech Stack

- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **Data Visualization**: Recharts SVG charting
- **Testing**: Vitest automated unit tests
- **Deployment**: GitHub Actions + GitHub Pages

---

## 🛠️ Local Development

```bash
# Clone the repository
git clone https://github.com/Lokeshwar2005/growthmcp-dashboard.git
cd growthmcp-dashboard

# Install dependencies
npm install

# Run unit tests
npm test

# Start local dev server
npm run dev

# Build for production
npm run build
```

---

## 🔗 Relationship to GrowthMCP

This repository is the web frontend client for [GrowthMCP](https://github.com/Lokeshwar2005/ai-growth-analytics-mcp). GrowthMCP is a derivative project built from the Meta Ads MCP server by ARTELL SOLUÇÕES TECNOLÓGICAS LTDA and licensed under Business Source License 1.1.
