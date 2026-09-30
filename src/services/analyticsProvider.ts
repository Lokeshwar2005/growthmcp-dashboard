import type {
  CampaignItem,
  CreativeItem,
  CohortRow,
  GrowthMetrics,
  InvestigationResult,
  AnalystQueryResult,
} from '../types/analytics';
import {
  DEMO_CAMPAIGNS,
  DEMO_CREATIVES,
  DEMO_COHORTS,
  DEMO_INVESTIGATION_CURRENT_PERIOD,
  DEMO_INVESTIGATION_PREVIOUS_PERIOD,
} from '../data/demoData';
import { calculateMetrics, deriveMetricsFromTotals } from './metricsEngine';
import { investigateGrowthIssue } from './investigationEngine';
import { analyzeGrowthQuery } from './analystEngine';

export interface AdAccountInfo {
  id: string;
  name: string;
  currency?: string;
  timezone_name?: string;
  account_status?: number;
}

export interface AnalyticsProvider {
  mode: 'demo' | 'live';
  getAdAccounts?(): Promise<AdAccountInfo[]>;
  getOverviewMetrics(accountId?: string): Promise<GrowthMetrics>;
  getCampaigns(accountId?: string): Promise<CampaignItem[]>;
  getCreatives(accountId?: string): Promise<CreativeItem[]>;
  getCohorts(): Promise<CohortRow[]>;
  runInvestigation(question: string, accountId?: string): Promise<InvestigationResult>;
  runAnalystQuery(query: string, accountId?: string): Promise<AnalystQueryResult>;
  checkHealth?(): Promise<{
    ok: boolean;
    message: string;
    toolsCount?: number;
    sessionId?: string;
    latencyMs?: number;
    tools?: string[];
  }>;
}

export class DemoAnalyticsProvider implements AnalyticsProvider {
  readonly mode = 'demo' as const;

  async getAdAccounts(): Promise<AdAccountInfo[]> {
    return [
      {
        id: 'act_2325766324921047',
        name: 'Acme Growth D2C (Demo)',
        currency: 'USD',
        timezone_name: 'America/Los_Angeles',
      },
    ];
  }

  async getOverviewMetrics(): Promise<GrowthMetrics> {
    return calculateMetrics(DEMO_CAMPAIGNS);
  }

  async getCampaigns(): Promise<CampaignItem[]> {
    return DEMO_CAMPAIGNS;
  }

  async getCreatives(): Promise<CreativeItem[]> {
    return DEMO_CREATIVES;
  }

  async getCohorts(): Promise<CohortRow[]> {
    return DEMO_COHORTS;
  }

  async runInvestigation(question: string): Promise<InvestigationResult> {
    return investigateGrowthIssue(
      question,
      DEMO_INVESTIGATION_CURRENT_PERIOD,
      DEMO_INVESTIGATION_PREVIOUS_PERIOD
    );
  }

  async runAnalystQuery(query: string): Promise<AnalystQueryResult> {
    return analyzeGrowthQuery(query, DEMO_INVESTIGATION_CURRENT_PERIOD);
  }

  async checkHealth() {
    return {
      ok: true,
      message: 'Demo Mode active (deterministic client dataset)',
      toolsCount: 12,
      latencyMs: 1,
      tools: [
        'calculate_growth_metrics',
        'compare_campaign_metrics',
        'detect_metric_anomalies',
        'analyze_growth_query',
        'get_metric_definition',
        'normalize_growth_records',
        'investigate_campaign',
        'analyze_creatives',
        'analyze_cohorts',
        'build_evidence_packet',
        'investigate_growth_issue',
        'investigate_live_meta_growth_issue',
      ],
    };
  }
}

/**
 * Standard Model Context Protocol (MCP) JSON-RPC 2.0 client
 * operating over Streamable HTTP (/mcp).
 * 
 * Security: NO Meta credentials or access tokens are ever sent from the frontend.
 * Authentication with Meta Graph API is handled strictly inside the operator's GrowthMCP process.
 */
export class GrowthMCPProvider implements AnalyticsProvider {
  readonly mode = 'live' as const;
  private endpoint: string;
  private sessionId: string | null = null;
  private isInitialized = false;
  private requestId = 0;

  constructor(endpoint?: string) {
    const raw = endpoint || (typeof window !== 'undefined' ? localStorage.getItem('growthmcp_endpoint') : '') || import.meta.env.VITE_GROWTHMCP_ENDPOINT || 'http://127.0.0.1:8080/mcp';
    this.endpoint = this.normalizeEndpoint(raw);
  }

  private normalizeEndpoint(url: string): string {
    let clean = (url || '').trim();
    if (!clean) return 'http://127.0.0.1:8080/mcp';
    // Remove trailing slashes
    clean = clean.replace(/\/+$/, '');
    // Ensure /mcp path is present
    if (!clean.endsWith('/mcp')) {
      clean = `${clean}/mcp`;
    }
    return clean;
  }

  setEndpoint(url: string): void {
    this.endpoint = this.normalizeEndpoint(url);
    this.sessionId = null;
    this.isInitialized = false;
    if (typeof window !== 'undefined') {
      localStorage.setItem('growthmcp_endpoint', this.endpoint);
    }
  }

  getEndpoint(): string {
    return this.endpoint;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Parse FastMCP Streamable HTTP response, which can be SSE (text/event-stream)
   * formatted as:
   * event: message
   * data: {"jsonrpc":"2.0",...}
   * or direct JSON.
   */
  private parseMcpResponse(rawText: string): any {
    if (!rawText || !rawText.trim()) {
      return null;
    }

    const trimmed = rawText.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return JSON.parse(trimmed);
      } catch {
        // Fall through to SSE parsing
      }
    }

    // Parse SSE lines
    const lines = rawText.split('\n');
    for (const line of lines) {
      const match = line.match(/^data:\s*(.+)$/);
      if (match && match[1]) {
        try {
          return JSON.parse(match[1]);
        } catch {
          // Continue scanning
        }
      }
    }

    throw new Error(`Failed to parse MCP Streamable HTTP response: ${rawText.slice(0, 150)}`);
  }

  /**
   * Execute low-level JSON-RPC 2.0 call over Streamable HTTP
   */
  async callMcp(method: string, params: Record<string, any> = {}): Promise<any> {
    if (!this.isInitialized && method !== 'initialize') {
      await this.initializeSession();
    }

    const id = ++this.requestId;
    const payload = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    };

    if (this.sessionId) {
      headers['mcp-session-id'] = this.sessionId;
    }

    let res: Response;
    try {
      res = await fetch(this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      this.isInitialized = false;
      this.sessionId = null;
      throw new Error(`Network failure connecting to GrowthMCP at ${this.endpoint}: ${err.message || 'Connection refused'}`);
    }

    // Capture or update session ID from response headers
    const newSessionId = res.headers.get('mcp-session-id');
    if (newSessionId) {
      this.sessionId = newSessionId;
    }

    if (!res.ok && res.status !== 202) {
      const errText = await res.text().catch(() => '');
      this.isInitialized = false;
      throw new Error(`GrowthMCP HTTP ${res.status}: ${errText || res.statusText}`);
    }

    if (res.status === 202) {
      return null;
    }

    const text = await res.text();
    const parsed = this.parseMcpResponse(text);

    if (parsed && parsed.error) {
      throw new Error(parsed.error.message || `GrowthMCP Error ${parsed.error.code}`);
    }

    return parsed?.result;
  }

  /**
   * Perform MCP handshake: initialize -> notifications/initialized
   */
  private async initializeSession(): Promise<void> {
    const initPayload = {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'growthmcp-dashboard',
        version: '1.0.0',
      },
    };

    const id = ++this.requestId;
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id,
        method: 'initialize',
        params: initPayload,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`GrowthMCP handshake failed (${res.status}): ${text || res.statusText}`);
    }

    const sessId = res.headers.get('mcp-session-id');
    if (sessId) {
      this.sessionId = sessId;
    }

    // Acknowledge initialization
    if (this.sessionId) {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
          'mcp-session-id': this.sessionId,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'notifications/initialized',
        }),
      }).catch(() => {});
    }

    this.isInitialized = true;
  }

  /**
   * Invoke a registered tool on the GrowthMCP server
   */
  async callTool(name: string, args: Record<string, any> = {}): Promise<any> {
    const result = await this.callMcp('tools/call', {
      name,
      arguments: args,
    });

    if (!result) return null;

    if (result.isError) {
      const msg = result.content?.[0]?.text || `Tool execution failed for ${name}`;
      throw new Error(msg);
    }

    if (result.structuredContent !== undefined) {
      return result.structuredContent;
    }

    const textContent = result.content?.[0]?.text;
    if (typeof textContent === 'string') {
      try {
        return JSON.parse(textContent);
      } catch {
        return textContent;
      }
    }

    return result;
  }

  /**
   * Health & latency diagnostic
   */
  async checkHealth(): Promise<{
    ok: boolean;
    message: string;
    toolsCount?: number;
    sessionId?: string;
    latencyMs?: number;
    tools?: string[];
  }> {
    const t0 = performance.now();
    try {
      this.isInitialized = false;
      this.sessionId = null;
      await this.initializeSession();
      const listRes = await this.callMcp('tools/list', {});
      const latencyMs = Math.round(performance.now() - t0);
      const tools = (listRes?.tools || []).map((t: any) => t.name);

      return {
        ok: true,
        message: 'Connected to live GrowthMCP server over Streamable HTTP',
        toolsCount: tools.length,
        sessionId: this.sessionId || undefined,
        latencyMs,
        tools,
      };
    } catch (err: any) {
      return {
        ok: false,
        message: err.message || 'Could not connect to GrowthMCP server',
        latencyMs: Math.round(performance.now() - t0),
      };
    }
  }

  async getAdAccounts(): Promise<AdAccountInfo[]> {
    try {
      const res = await this.callTool('get_ad_accounts', {});
      if (Array.isArray(res)) {
        return res.map((act) => ({
          id: act.id || act.account_id || '',
          name: act.name || `Ad Account ${act.id}`,
          currency: act.currency || 'USD',
          timezone_name: act.timezone_name,
        }));
      }
      if (res && Array.isArray(res.data)) {
        return res.data.map((act: any) => ({
          id: act.id || act.account_id || '',
          name: act.name || `Ad Account ${act.id}`,
          currency: act.currency || 'USD',
          timezone_name: act.timezone_name,
        }));
      }
      return [];
    } catch (err: any) {
      console.warn('getAdAccounts error:', err);
      throw err;
    }
  }

  async getCampaigns(accountId?: string): Promise<CampaignItem[]> {
    try {
      const campaignsRaw = await this.callTool('get_campaigns', accountId ? { account_id: accountId } : {});
      const campaignList = Array.isArray(campaignsRaw) ? campaignsRaw : campaignsRaw?.data || [];

      if (!campaignList || campaignList.length === 0) {
        return [];
      }

      // Fetch insights for active account/campaigns
      let insightsList: any[] = [];
      try {
        const insightsRaw = await this.callTool('get_insights', {
          object_id: accountId || campaignList[0]?.account_id || campaignList[0]?.id,
          level: 'campaign',
          date_preset: 'last_14d',
        });
        insightsList = Array.isArray(insightsRaw) ? insightsRaw : insightsRaw?.data || [];
      } catch (err) {
        console.warn('Could not fetch live insights, using campaign metadata only', err);
      }

      // Index insights by campaign_id
      const insightMap = new Map<string, any>();
      for (const ins of insightsList) {
        const id = ins.campaign_id || ins.id;
        if (id) insightMap.set(String(id), ins);
      }

      return campaignList.map((c: any) => {
        const ins = insightMap.get(String(c.id)) || {};
        const spend = Number(ins.spend || ins.cost || 0);
        const impressions = Number(ins.impressions || 0);
        const clicks = Number(ins.clicks || ins.link_clicks || 0);

        // Extract purchases & leads from Meta actions arrays
        let conversions = Number(ins.conversions || 0);
        let leads = Number(ins.leads || 0);
        let revenue = Number(ins.revenue || 0);

        if (Array.isArray(ins.actions)) {
          for (const a of ins.actions) {
            const type = String(a.action_type || '').toLowerCase();
            const val = Number(a.value || 0);
            if (type.includes('purchase') || type === 'omni_purchase') {
              conversions += val;
            } else if (type.includes('lead')) {
              leads += val;
            }
          }
        }

        if (Array.isArray(ins.action_values)) {
          for (const av of ins.action_values) {
            const type = String(av.action_type || '').toLowerCase();
            if (type.includes('purchase') || type === 'omni_purchase') {
              revenue += Number(av.value || 0);
            }
          }
        }

        const roas = spend > 0 ? revenue / spend : 0;
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const cpc = clicks > 0 ? spend / clicks : 0;
        const cpl = leads > 0 ? spend / leads : 0;
        const cpa = conversions > 0 ? spend / conversions : 0;

        let status: CampaignItem['status'] = 'Active';
        const rawStatus = String(c.status || '').toUpperCase();
        if (rawStatus === 'PAUSED') status = 'Paused';
        else if (rawStatus.includes('LEARNING')) status = 'Learning';

        let objective: CampaignItem['objective'] = 'Conversions';
        const rawObj = String(c.objective || '').toUpperCase();
        if (rawObj.includes('LEAD')) objective = 'Lead Generation';
        else if (rawObj.includes('CATALOG')) objective = 'Catalog Sales';
        else if (rawObj.includes('AWARENESS') || rawObj.includes('REACH')) objective = 'Brand Awareness';

        return {
          id: String(c.id),
          name: c.name || `Campaign ${c.id}`,
          platform: 'Meta' as const,
          status,
          objective,
          spend,
          revenue,
          roas,
          impressions,
          clicks,
          ctr,
          cpc,
          leads,
          cpl,
          conversions,
          cpa,
          daily_budget: Number(c.daily_budget || 0) / 100, // Meta stores in cents
        };
      });
    } catch (err: any) {
      console.warn('getCampaigns error:', err);
      throw err;
    }
  }

  async getOverviewMetrics(accountId?: string): Promise<GrowthMetrics> {
    const campaigns = await this.getCampaigns(accountId);
    if (!campaigns.length) {
      return deriveMetricsFromTotals({
        spend: 0,
        revenue: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        leads: 0,
      });
    }

    const totals = campaigns.reduce(
      (acc, c) => ({
        spend: acc.spend + c.spend,
        revenue: acc.revenue + c.revenue,
        impressions: acc.impressions + c.impressions,
        clicks: acc.clicks + c.clicks,
        conversions: acc.conversions + c.conversions,
        leads: acc.leads + c.leads,
      }),
      { spend: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0, leads: 0 }
    );

    return deriveMetricsFromTotals(totals);
  }

  async getCreatives(): Promise<CreativeItem[]> {
    return DEMO_CREATIVES;
  }

  async getCohorts(): Promise<CohortRow[]> {
    return DEMO_COHORTS;
  }

  async runInvestigation(question: string, accountId?: string): Promise<InvestigationResult> {
    try {
      if (accountId) {
        const res = await this.callTool('investigate_live_meta_growth_issue', {
          account_id: accountId,
        });
        if (res && res.question) return res;
      }
    } catch (err) {
      console.warn('investigate_live_meta_growth_issue unavailable, falling back to local engine', err);
    }
    return new DemoAnalyticsProvider().runInvestigation(question);
  }

  async runAnalystQuery(query: string): Promise<AnalystQueryResult> {
    try {
      const res = await this.callTool('analyze_growth_query', { query });
      if (res && res.query) return res;
    } catch (err) {
      console.warn('analyze_growth_query live call failed, falling back to local analyst', err);
    }
    return new DemoAnalyticsProvider().runAnalystQuery(query);
  }
}

export const defaultProvider = new DemoAnalyticsProvider();
