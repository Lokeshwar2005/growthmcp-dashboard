import type { CanonicalRecord, GrowthMetrics, AnalystQueryResult } from '../types/analytics';
import { calculateMetrics, formatCurrency, formatPercent, formatMultiplier, formatNumber } from './metricsEngine';

const METRIC_ALIASES: Record<string, keyof GrowthMetrics> = {
  'roas': 'roas',
  'return on ad spend': 'roas',
  'revenue': 'revenue',
  'spend': 'spend',
  'cost': 'spend',
  'impressions': 'impressions',
  'impression': 'impressions',
  'clicks': 'clicks',
  'click': 'clicks',
  'ctr': 'ctr',
  'click through rate': 'ctr',
  'cpc': 'cpc',
  'cost per click': 'cpc',
  'cpa': 'cpa',
  'cost per acquisition': 'cpa',
  'cost per conversion': 'cpa',
  'cpl': 'cpl',
  'cost per lead': 'cpl',
  'leads': 'leads',
  'lead': 'leads',
  'conversions': 'conversions',
  'conversion': 'conversions',
  'conversion rate': 'conversion_rate',
  'cvr': 'conversion_rate',
};

const METRIC_LABELS: Record<keyof GrowthMetrics, string> = {
  roas: 'ROAS',
  revenue: 'Revenue',
  spend: 'Spend',
  impressions: 'Impressions',
  clicks: 'Clicks',
  ctr: 'CTR',
  cpc: 'CPC',
  cpa: 'CPA',
  cpl: 'CPL',
  leads: 'Leads',
  conversions: 'Conversions',
  conversion_rate: 'Conversion Rate',
};

export function extractRequestedMetrics(query: string): Array<keyof GrowthMetrics> {
  const lowered = query.toLowerCase();
  const sortedAliases = Object.keys(METRIC_ALIASES).sort((a, b) => b.length - a.length);

  const matches: Array<{ metric: keyof GrowthMetrics; index: number; length: number }> = [];

  for (const alias of sortedAliases) {
    let pos = lowered.indexOf(alias);
    while (pos !== -1) {
      matches.push({ metric: METRIC_ALIASES[alias], index: pos, length: alias.length });
      pos = lowered.indexOf(alias, pos + 1);
    }
  }

  // Sort by start position; prefer longer aliases on overlap
  matches.sort((a, b) => a.index - b.index || b.length - a.length);

  const selected: Array<keyof GrowthMetrics> = [];
  let lastEnd = -1;
  for (const m of matches) {
    if (m.index >= lastEnd) {
      if (!selected.includes(m.metric)) {
        selected.push(m.metric);
      }
      lastEnd = m.index + m.length;
    }
  }

  return selected.length > 0 ? selected : ['roas'];
}

function extractFilters(query: string, records: CanonicalRecord[]) {
  const lowered = query.toLowerCase();
  const filter: { campaign?: string; platform?: string } = {};

  // Check platform
  if (lowered.includes('meta') || lowered.includes('facebook') || lowered.includes('instagram')) {
    filter.platform = 'Meta';
  } else if (lowered.includes('google') || lowered.includes('pmax') || lowered.includes('search')) {
    filter.platform = 'Google';
  } else if (lowered.includes('tiktok')) {
    filter.platform = 'TikTok';
  }

  // Check campaign match
  for (const r of records) {
    const cName = r.campaign_name.toLowerCase();
    if (cName.length > 3 && lowered.includes(cName)) {
      filter.campaign = r.campaign_name;
      break;
    }
  }

  return filter;
}

export function formatMetricValue(metric: keyof GrowthMetrics, value: number): string {
  switch (metric) {
    case 'spend':
    case 'revenue':
    case 'cpc':
    case 'cpa':
    case 'cpl':
      return formatCurrency(value);
    case 'ctr':
    case 'conversion_rate':
      return formatPercent(value);
    case 'roas':
      return formatMultiplier(value);
    default:
      return formatNumber(value);
  }
}

/**
 * Deterministic AI Growth Analyst query engine.
 * Mirrors `growthmcp.core.analyst.analyze_growth_query`.
 */
export function analyzeGrowthQuery(
  query: string,
  records: CanonicalRecord[]
): AnalystQueryResult {
  const requestedMetrics = extractRequestedMetrics(query);
  const filters = extractFilters(query, records);

  let filtered = [...records];
  if (filters.platform) {
    filtered = filtered.filter(r => r.platform.toLowerCase() === filters.platform!.toLowerCase());
  }
  if (filters.campaign) {
    filtered = filtered.filter(r => r.campaign_name.toLowerCase() === filters.campaign!.toLowerCase());
  }

  const metrics = calculateMetrics(filtered);

  // Generate explanation
  const metricPhrases = requestedMetrics
    .map(m => `${METRIC_LABELS[m]} is ${formatMetricValue(m, metrics[m])}`)
    .join(', and ');

  const scope = filters.campaign
    ? `for campaign "${filters.campaign}"`
    : filters.platform
    ? `for ${filters.platform} Ads`
    : `across all ${filtered.length} matching marketing records`;

  const explanation = `Based on deterministic aggregate totals ${scope}: ${metricPhrases}. (Spend: ${formatCurrency(metrics.spend)}, Revenue: ${formatCurrency(metrics.revenue)}, Conversions: ${formatNumber(metrics.conversions)}).`;

  return {
    query,
    requested_metrics: requestedMetrics,
    filter_applied: filters,
    record_count: filtered.length,
    metrics,
    explanation,
    evidence_rows: filtered.slice(0, 10),
  };
}
