import type { CanonicalRecord, GrowthMetrics } from '../types/analytics';

/**
 * Platform-neutral growth analytics calculator.
 * Strictly mirrors `growthmcp.core.analytics._metrics`.
 */
export function calculateMetrics(
  records: Array<Partial<CanonicalRecord>> | CanonicalRecord[]
): GrowthMetrics {
  const initialTotals = {
    spend: 0,
    revenue: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    leads: 0,
  };

  const totals = records.reduce((acc, r) => ({
    spend: acc.spend + (Number(r.spend) || 0),
    revenue: acc.revenue + (Number(r.revenue) || 0),
    impressions: acc.impressions + (Number(r.impressions) || 0),
    clicks: acc.clicks + (Number(r.clicks) || 0),
    conversions: acc.conversions + (Number(r.conversions) || 0),
    leads: acc.leads + (Number(r.leads) || 0),
  }), initialTotals);

  return deriveMetricsFromTotals(totals);
}

export function deriveMetricsFromTotals(totals: {
  spend: number;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  leads: number;
}): GrowthMetrics {
  const { spend, revenue, impressions, clicks, conversions, leads } = totals;

  return {
    spend,
    revenue,
    impressions,
    clicks,
    conversions,
    leads,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0.0,
    cpc: clicks > 0 ? spend / clicks : 0.0,
    cpa: conversions > 0 ? spend / conversions : 0.0,
    cpl: leads > 0 ? spend / leads : 0.0,
    conversion_rate: clicks > 0 ? (conversions / clicks) * 100 : 0.0,
    roas: spend > 0 ? revenue / spend : 0.0,
  };
}

/**
 * Anomaly detection via population Z-Score.
 * Mirrors `growthmcp.core.analytics.detect_metric_anomalies`.
 */
export function detectAnomalies(values: number[], zThreshold = 2.0) {
  if (values.length < 3) {
    return { mean: 0, stddev: 0, anomalies: [] };
  }

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stddev = Math.sqrt(variance);

  if (stddev === 0) {
    return { mean, stddev: 0, anomalies: [] };
  }

  const anomalies = values
    .map((val, index) => {
      const z = (val - mean) / stddev;
      return Math.abs(z) >= zThreshold ? { index, value: val, z_score: z } : null;
    })
    .filter((a): a is { index: number; value: number; z_score: number } => a !== null);

  return { mean, stddev, zThreshold, anomalies };
}

export function formatCurrency(amount: number, compact = false): string {
  if (compact && Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (compact && Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(val: number, withSign = false): string {
  const formatted = `${val.toFixed(2)}%`;
  if (withSign && val > 0) return `+${formatted}`;
  return formatted;
}

export function formatMultiplier(val: number): string {
  return `${val.toFixed(2)}x`;
}

export function formatNumber(val: number, compact = false): string {
  if (compact && Math.abs(val) >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(1)}M`;
  }
  if (compact && Math.abs(val) >= 1_000) {
    return `${(val / 1_000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat('en-US').format(Math.round(val));
}
