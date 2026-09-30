/**
 * Canonical data schemas for GrowthMCP Dashboard.
 * Matches GrowthMCP Python schemas (CANONICAL_FIELDS, _metrics, investigations).
 */

export interface CanonicalRecord {
  date: string;
  source?: string;
  platform: 'Meta' | 'Google' | 'TikTok' | 'Shopify' | 'Organic';
  account_id?: string;
  campaign_id: string;
  campaign_name: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  creative_id?: string;
  creative_name?: string;
  spend: number;
  revenue: number;
  impressions: number;
  clicks: number;
  leads: number;
  conversions: number;
}

export interface GrowthMetrics {
  spend: number;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  leads: number;
  ctr: number;             // percentage (clicks / impressions * 100)
  cpc: number;             // currency (spend / clicks)
  cpa: number;             // currency (spend / conversions)
  cpl: number;             // currency (spend / leads)
  conversion_rate: number; // percentage (conversions / clicks * 100)
  roas: number;            // multiplier (revenue / spend)
}

export interface MetricDelta {
  current: number;
  previous: number;
  change_pct: number | null;
}

export interface DriverComponent {
  component: string;
  delta: MetricDelta;
}

export interface DimensionMovement {
  value: string;
  current_metrics: GrowthMetrics;
  previous_metrics: GrowthMetrics;
  comparison: MetricDelta;
  movement_magnitude_pct: number | null;
  current_record_count: number;
  previous_record_count: number;
}

export interface InvestigationResult {
  question: string;
  target_metric: keyof GrowthMetrics;
  summary: string;
  current_metrics: GrowthMetrics;
  previous_metrics: GrowthMetrics;
  target_delta: MetricDelta;
  drivers: DriverComponent[];
  breakdowns: {
    campaign: DimensionMovement[];
    creative?: DimensionMovement[];
    platform?: DimensionMovement[];
  };
  evidence_count: number;
  limitations: string[];
}

export interface AnalystQueryResult {
  query: string;
  requested_metrics: string[];
  filter_applied: {
    campaign?: string;
    platform?: string;
    date_start?: string;
    date_end?: string;
  };
  record_count: number;
  metrics: GrowthMetrics;
  explanation: string;
  evidence_rows: CanonicalRecord[];
}

export interface CohortRow {
  cohort: string; // e.g. "2026-05"
  cohort_users: number;
  revenue: number;
  ltv: number;
  retention: {
    [month: string]: {
      active_users: number;
      retention_pct: number;
    };
  };
}

export interface CreativeItem {
  id: string;
  name: string;
  thumbnailUrl?: string;
  format: 'Video (1:1)' | 'Reel (9:16)' | 'Carousel' | 'Static Image';
  campaign_name: string;
  status: 'Active' | 'Fatigued' | 'Testing' | 'Scaling';
  spend: number;
  revenue: number;
  impressions: number;
  clicks: number;
  leads: number;
  conversions: number;
  ctr: number;
  cpl: number;
  roas: number;
  movement_pct: number;
}

export interface CampaignItem {
  id: string;
  name: string;
  platform: 'Meta' | 'Google' | 'TikTok';
  status: 'Active' | 'Paused' | 'Learning' | 'Budget Constrained';
  objective: 'Conversions' | 'Lead Generation' | 'Catalog Sales' | 'Brand Awareness';
  spend: number;
  revenue: number;
  roas: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  leads: number;
  cpl: number;
  conversions: number;
  cpa: number;
  daily_budget: number;
}

export type NavigationTab = 
  | 'overview'
  | 'campaigns'
  | 'acquisition'
  | 'creatives'
  | 'cohorts'
  | 'revenue'
  | 'investigations'
  | 'analyst'
  | 'datasources'
  | 'system';
