import type { CampaignItem, CreativeItem, CohortRow, GrowthMetrics, InvestigationResult, AnalystQueryResult } from '../types/analytics';
import { DEMO_CAMPAIGNS, DEMO_CREATIVES, DEMO_COHORTS, DEMO_INVESTIGATION_CURRENT_PERIOD, DEMO_INVESTIGATION_PREVIOUS_PERIOD } from '../data/demoData';
import { calculateMetrics } from './metricsEngine';
import { investigateGrowthIssue } from './investigationEngine';
import { analyzeGrowthQuery } from './analystEngine';

export interface AnalyticsProvider {
  mode: 'demo' | 'live';
  getOverviewMetrics(): Promise<GrowthMetrics>;
  getCampaigns(): Promise<CampaignItem[]>;
  getCreatives(): Promise<CreativeItem[]>;
  getCohorts(): Promise<CohortRow[]>;
  runInvestigation(question: string): Promise<InvestigationResult>;
  runAnalystQuery(query: string): Promise<AnalystQueryResult>;
}

export class DemoAnalyticsProvider implements AnalyticsProvider {
  readonly mode = 'demo' as const;

  async getOverviewMetrics(): Promise<GrowthMetrics> {
    return calculateMetrics(DEMO_INVESTIGATION_CURRENT_PERIOD);
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
}

export class GrowthMCPProvider implements AnalyticsProvider {
  readonly mode = 'live' as const;
  private endpoint: string;

  constructor(endpoint?: string) {
    this.endpoint = endpoint || import.meta.env.VITE_GROWTHMCP_ENDPOINT || '';
  }

  isConfigured(): boolean {
    return Boolean(this.endpoint && this.endpoint.trim().length > 0);
  }

  getEndpoint(): string {
    return this.endpoint;
  }

  async getOverviewMetrics(): Promise<GrowthMetrics> {
    if (!this.isConfigured()) {
      throw new Error('Live GrowthMCP Streamable HTTP endpoint is not configured.');
    }
    // Conceptual placeholder for Streamable HTTP JSON-RPC call
    const res = await fetch(`${this.endpoint}/call/calculate_growth_metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: [] }),
    });
    const data = await res.json();
    return data.totals;
  }

  async getCampaigns(): Promise<CampaignItem[]> {
    return new DemoAnalyticsProvider().getCampaigns();
  }

  async getCreatives(): Promise<CreativeItem[]> {
    return new DemoAnalyticsProvider().getCreatives();
  }

  async getCohorts(): Promise<CohortRow[]> {
    return new DemoAnalyticsProvider().getCohorts();
  }

  async runInvestigation(question: string): Promise<InvestigationResult> {
    return new DemoAnalyticsProvider().runInvestigation(question);
  }

  async runAnalystQuery(query: string): Promise<AnalystQueryResult> {
    return new DemoAnalyticsProvider().runAnalystQuery(query);
  }
}

export const defaultProvider = new DemoAnalyticsProvider();
