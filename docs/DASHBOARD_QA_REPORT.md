# GrowthMCP Dashboard — Functional QA & Feature Verification Report

**Test Date:** October 1, 2026  
**Frontend Commit Tested:** `684f60c` (with QA fixes applied)  
**Backend Commit Tested:** `033590f`  
**Target Environment:** macOS (Darwin ARM64) / Node.js v26.7.0 / Python 3.11.7  
**Deployment URL:** https://lokeshwar2005.github.io/growthmcp-dashboard/  

---

## 1. Overall QA Summary

| Category | Status | Details |
| :--- | :--- | :--- |
| **Frontend Test Suite** | **PASS** | 11 unit tests passed across 3 test suites (`metricsEngine`, `investigationEngine`, `analystEngine`). |
| **Frontend Static Analysis** | **PASS** | `oxlint` found 0 warnings and 0 errors across 30 source files. |
| **Frontend Production Build** | **PASS** | `tsc -b && vite build` completed successfully without warnings or type errors. |
| **Backend MCP Test Suite** | **PASS** | 24 tests passed, 2 deselected (live Meta token tests), 0 failures in `ai-growth-analytics-mcp`. |
| **Security Audit** | **PASS** | 0 secrets, 0 API keys, 0 OAuth tokens, 0 `.env` files detected in repository or distribution bundle. |
| **Navigation & Routing** | **PASS** | Hash-based routing (`#overview`, `#campaigns`, etc.) verified across all 10 sidebar views. |

---

## 2. Page-by-Page Verification Results

### Page 1: Overview
- **Status:** **PASS**
- **Component:** `src/components/views/OverviewView.tsx`
- **Data Source:** `DEMO_CAMPAIGNS` (7 records) and `DEMO_DAILY_PERFORMANCE` (7 daily pacing records).
- **Verification Details:**
  - All 8 KPI cards render deterministic sums: Total Ad Spend ($23,470.50), Gross Ad Revenue ($48,596.88), Blended ROAS (2.07x), Qualified Leads (3,288), Conversions (1,093), Blended CPL ($7.14), CTR (1.65%), CVR (5.13%).
  - Date Window & Trajectory Context Bar clearly displays Selected Window, Active Daily Trajectory, and Baseline Comparison.
  - Interactive info tooltips on all 8 cards match GrowthMCP canonical schemas (`get_metric_definition`).
  - Funnel displays attributed paid progression (1.29M Impressions → 21.3k Clicks → 2,900 Attributed Leads → 1,003 Store Purchases) with explicit Methodology Distinction banner.
  - Zero text clipping, zero layout shifts, zero console errors.

### Page 2: Campaigns
- **Status:** **PASS**
- **Components:** `src/components/views/CampaignsView.tsx`, `src/components/views/CampaignDetailModal.tsx`
- **Data Source:** `DEMO_CAMPAIGNS` (Meta, Google, TikTok).
- **Verification Details:**
  - Table renders all 7 active and paused campaigns with exact spend, revenue, ROAS, clicks, CTR, leads, CPL, conversions, and delivery statuses.
  - Search filter verified: partial queries ("Prospecting", "Brand") filter table correctly; non-matching queries display an explicit empty-state message.
  - Platform filter buttons ('All', 'Meta', 'Google', 'TikTok') filter rows accurately.
  - Column sorting verified across spend, revenue, ROAS, clicks, CTR, leads, CPL, and conversions in both ascending and descending directions.
  - Clicking any campaign row opens `CampaignDetailModal`.
  - Campaign modal displays platform, ID, objective, daily budget, quick stats, ad set delivery breakdown, and dynamic evidence source metadata (`{campaign.platform} Ads via GrowthMCP canonical records`).
  - "Run Investigation" button launches the Investigations view with campaign question pre-populated.
  - Closing modal clears selection with zero stale data retention.

### Page 3: Acquisition
- **Status:** **PASS**
- **Component:** `src/components/views/AcquisitionView.tsx`
- **Data Source:** `DEMO_CAMPAIGNS` via `calculateMetrics`.
- **Verification Details:**
  - Unit economics verified: Total Spend ($23,470.50), Impressions (1.42M), Clicks (24,408), CTR (1.65%), CPC ($0.96), Leads (3,288), CPL ($7.14), Conversions (1,093), CPA/CAC ($21.47), Conv. Rate (4.48%).
  - Zero divide-by-zero hazards: calculation refactored to use centralized `metricsEngine.ts` with zero-guards.
  - Waterfall stages verified: Top-of-Funnel Impressions (1.42M) → Traffic Clicks (24,408, 1.65% CTR) → Qualified Leads (3,288, 13.5% of Clicks) → Purchases (1,093, 4.48% CVR).
  - Channel economics breakdown table matches campaign sums: Meta ($15,470.50 spend / $1.00 CPC / $7.70 CPL / $25.36 CPA), Google ($6,050.00 spend / $1.01 CPC / $6.11 CPL / $13.91 CPA), TikTok ($1,950.00 spend / $0.67 CPC / $6.72 CPL / $40.63 CPA).

### Page 4: Creatives
- **Status:** **PASS**
- **Component:** `src/components/views/CreativesView.tsx`
- **Data Source:** `DEMO_CREATIVES` (5 creative items).
- **Verification Details:**
  - Renders ad asset list with creative format, parent campaign, spend, revenue, ROAS, CTR, CPL, movement percentage, and lifecycle status.
  - Format filters verified: 'All' (5), 'Reel' (2), 'Video' (1), 'Carousel' (1), 'Static' (1).
  - Top Performing Asset (Scaling) card correctly surfaces `crt_01` (Founder Story Hook, 2.00x ROAS, +14.2% movement).
  - Creative Fatigue Alert card correctly surfaces `crt_04` (UGC Unboxing & First Reaction, 1.10x ROAS, -32.8% movement).
  - Movement badges correctly render positive (`+14.2%`) with `ArrowUpRight` in emerald and negative (`-32.8%`) with `ArrowDownRight` in rose.

### Page 5: Cohorts
- **Status:** **PASS**
- **Component:** `src/components/views/CohortsView.tsx`
- **Data Source:** `DEMO_COHORTS` (5 monthly cohorts from 2026-01 to 2026-05).
- **Verification Details:**
  - Retention heatmap renders retention percentages and active user counts from Month 0 to Month 4.
  - Unmatured cohort months display clean em-dash (`—`) placeholders.
  - Color gradient dynamically reflects retention thresholds (≥90%, ≥45%, ≥35%, ≥28%, <28%).
  - Cumulative LTV values ($84.00, $82.00, $78.00, $73.00, $67.00) match customer acquisition models.
  - Total users and revenue stay isolated from paid campaign totals.

### Page 6: Revenue
- **Status:** **PASS**
- **Component:** `src/components/views/RevenueView.tsx`
- **Data Source:** `DEMO_CAMPAIGNS`.
- **Verification Details:**
  - Capital-to-revenue progression flow clearly renders: Total Ad Capital ($23,470.50) → Orders / Purchases (1,093, Avg AOV $44.46) → Attributed Gross Revenue ($48,596.88, 2.07x Net Return).
  - Zero divide-by-zero risks: `aggregateRoas` and `Avg AOV` guarded against zero totals.
  - Recharts horizontal bar chart sorts and renders revenue generation by campaign.
  - Attribution badge states: `Attribution Model: Demo attribution model (7-day click / 1-day view canonical conversion attribution)` with `Last-Touch Canonical` badge.
  - Zero unsupported claims of organic or direct revenue attribution.

### Page 7: Investigations
- **Status:** **PASS**
- **Component:** `src/components/views/InvestigationsView.tsx`
- **Engine:** `src/services/investigationEngine.ts`
- **Data Source:** `DEMO_INVESTIGATION_CURRENT_PERIOD` vs `DEMO_INVESTIGATION_PREVIOUS_PERIOD`.
- **Verification Details:**
  - Query `"Why did ROAS drop?"`: Correctly identifies target metric `ROAS`, compares current ($10,500 spend / $12,580 rev = 1.20x) against baseline ($7,100 spend / $19,000 rev = 2.68x), calculates delta (-55.2%), decomposes revenue (-33.8%) and spend (+47.9%) drivers, ranks campaign contributions.
  - Query `"Why did CPL increase?"`: Correctly identifies target metric `CPL`, decomposes spend and lead components, and dynamically adjusts campaign contribution table headers and cell values to `Current CPL` and `Previous CPL` via `formatMetricValue`.
  - Limitations box displays audit constraints matching GrowthMCP Python engine (`investigate_growth_issue`).
  - Seamlessly receives pre-populated queries from Campaigns view and runs automatically.

### Page 8: AI Analyst
- **Status:** **PASS**
- **Component:** `src/components/views/AIAnalystView.tsx`
- **Engine:** `src/services/analystEngine.ts`
- **Data Source:** `DEMO_INVESTIGATION_CURRENT_PERIOD` (3 canonical records).
- **Verification Details:**
  - Query 1: *"What is the ROAS?"* → Deterministic answer: `ROAS is 1.19x`.
  - Query 2: *"What is the CPL?"* → Deterministic answer: `CPL is $8.27`.
  - Query 3: *"What is the CTR?"* → Deterministic answer: `CTR is 1.00%`.
  - Query 4: *"What is the conversion rate?"* → Deterministic answer: `Conversion Rate is 2.91%`.
  - Query 5: *"How much did we spend?"* → Deterministic answer: `Spend is $10,500.00`.
  - Query 6: *"How much revenue did we generate?"* → Deterministic answer: `Revenue is $12,580.00`.
  - Query 7: *"Which campaign has the highest ROAS?"* → Deterministically identifies top performer: `Highest ROAS campaign is "Brand Search" at 3.00x`.
  - Query 8: *"Why did ROAS drop?"* → Extracts ROAS metric and returns audit evidence rows.
  - Header explicitly declares: `Deterministic analytics engine. Converts natural language queries into transparent, reproducible calculations without calling external LLMs.`

### Page 9: Data Sources
- **Status:** **PASS**
- **Component:** `src/components/views/DataSourcesView.tsx`
- **Verification Details:**
  - Meta Ads, Google Ads, TikTok Ads are explicitly marked with `Demo Dataset` status badges.
  - GA4 and Shopify are marked `Available / Unset`.
  - CSV Import is marked `Ready for Upload`.
  - Zero providers falsely claim to be connected to live client accounts.
  - Security Isolation notice explains that client credentials are never sent to or stored by the static dashboard.

### Page 10: System / MCP
- **Status:** **PASS**
- **Component:** `src/components/views/SystemView.tsx`
- **Verification Details:**
  - Accurately catalogs all 12 registered GrowthMCP tools matching `ai-growth-analytics-mcp`.
  - Architecture status cards indicate FastMCP architecture, stdio & Streamable HTTP transports, and Demo Mode client status.
  - Self-hosted endpoint input form allows saving a local Streamable HTTP endpoint URL in browser storage without transmitting credentials.
  - Zero secrets, zero access tokens, zero OAuth secrets rendered.

---

## 3. Data Consistency Cross-Check

| Metric | Overview Page | Campaigns Page | Acquisition Page | Revenue Page | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Total Spend** | $23,470.50 | $23,470.50 | $23,470.50 | $23,470.50 | **PASS** | Exact match across all views. |
| **Gross Revenue** | $48,596.88 | $48,596.88 | — | $48,596.88 | **PASS** | Exact match across all views. |
| **Blended ROAS** | 2.07x | 2.07x | — | 2.07x | **PASS** | Exact match across all views. |
| **Qualified Leads**| 3,288 | 3,288 | 3,288 | — | **PASS** | Exact match across all views. |
| **Conversions** | 1,093 | 1,093 | 1,093 | 1,093 | **PASS** | Exact match across all views. |
| **Blended CPL** | $7.14 | $7.14 | $7.14 | — | **PASS** | Exact match across all views. |
| **Blended CTR** | 1.65% | 1.65% | 1.65% | — | **PASS** | Exact match across all views. |

---

## 4. Bugs Discovered & Fixed During QA

1. **Investigations Campaign Table Hardcoded ROAS Columns**
   - *Issue:* In `InvestigationsView.tsx`, the campaign movement table hardcoded `Current ROAS` and `Previous ROAS` column headers and multiplier formatting even when investigating CPL, CTR, or CPA questions.
   - *Fix:* Dynamically updated headers to `Current ${result.target_metric.toUpperCase()}` and cell values using `formatMetricValue(result.target_metric, ...)`.

2. **Campaign Detail Modal Evidence Attribution Text**
   - *Issue:* In `CampaignDetailModal.tsx`, the evidence metadata section hardcoded "Meta Graph API (v21.0)" even for Google Ads and TikTok Ads campaigns.
   - *Fix:* Made the data source string dynamic (`${campaign.platform} Ads via GrowthMCP canonical records`).

3. **Acquisition & Revenue Potential Divide-by-Zero**
   - *Issue:* In `AcquisitionView.tsx` and `RevenueView.tsx`, ad-hoc divisions for CTR, CPC, CPL, CPA, CVR, ROAS, and AOV lacked zero-guards.
   - *Fix:* Refactored `AcquisitionView.tsx` to derive metrics via `calculateMetrics` from `metricsEngine.ts` and added explicit zero-guards in `RevenueView.tsx`.

4. **Campaigns Table Zero-Match Search Empty State**
   - *Issue:* When searching for a non-existent campaign, the table body rendered blank without user feedback.
   - *Fix:* Added an explicit empty-state table row notifying the user of zero search matches.

5. **TopBar Data Source Badge Clarity**
   - *Issue:* The badge in `TopBar.tsx` read "Meta Insights" with a green active indicator, potentially implying a live Meta connection in Demo Mode.
   - *Fix:* Updated to "Multi-Channel Feed" to accurately reflect the multi-platform demo dataset.

6. **AI Analyst Superlative Query Support**
   - *Issue:* Queries such as "Which campaign has the highest ROAS?" returned the aggregate ROAS without answering which campaign ranked highest.
   - *Fix:* Added deterministic campaign-ranking logic in `analystEngine.ts` to identify and report the top/bottom campaign for superlative queries.

---

## 5. Security & Isolation Verification

- **Credential Scan:** Grepped entire frontend codebase and production build `dist/` directory for `META_ACCESS_TOKEN`, `EAA`, `secret`, `api_key`, `token`. Result: **0 credentials found**.
- **Environment Variables:** No `.env` or `.env.production` files bundled.
- **Network Isolation:** In Demo Mode, zero outbound network requests are made to `graph.facebook.com` or third-party APIs.
- **Provider Isolation:** `DemoAnalyticsProvider` executes 100% locally in-browser. `GrowthMCPProvider` guards against missing endpoints with explicit error handling.

---

## 6. Known Limitations & Architecture Boundaries

1. **Demo Mode Dataset Scope:**
   The public dashboard runs on deterministic datasets representing a $150k/mo D2C brand. TopBar date range adjustments dynamically update Overview window descriptions, while underlying data arrays represent fixed reference periods.
2. **Deterministic AI Analyst:**
   The AI Analyst is a deterministic parser and formula evaluator. It executes rule-based entity/metric extraction and aggregations matching GrowthMCP's Python implementation; it does not call external LLM APIs (OpenAI, Anthropic, Gemini).
3. **Live Mode Transport Prerequisite:**
   Connecting to Live Mode requires a running GrowthMCP daemon with Streamable HTTP enabled (`port 8080`).

---

## 7. Recommended Next Development Phase

1. **Streamable HTTP Client Bridge:** Implement the JSON-RPC SSE client in `GrowthMCPProvider` to connect directly to a live local GrowthMCP daemon.
2. **Live Account Discovery:** Connect `DataSourcesView` to GrowthMCP's `discover_meta_ad_accounts` tool to let users select ad accounts dynamically.
3. **Dynamic Date Range Queries:** Parameterize `runInvestigation` and `runAnalystQuery` to forward selected date intervals to the backend engine.
