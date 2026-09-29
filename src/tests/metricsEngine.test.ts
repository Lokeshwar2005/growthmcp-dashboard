import { describe, it, expect } from 'vitest';
import {
  calculateMetrics,
  deriveMetricsFromTotals,
  detectAnomalies,
  formatCurrency,
  formatPercent,
  formatMultiplier,
} from '../services/metricsEngine';

describe('Metrics Engine Calculations', () => {
  it('correctly calculates ROAS, CTR, CPC, CPL, and Conversion Rate from raw totals', () => {
    const totals = {
      spend: 1000,
      revenue: 2500,
      impressions: 50000,
      clicks: 1000,
      conversions: 50,
      leads: 100,
    };

    const metrics = deriveMetricsFromTotals(totals);

    expect(metrics.roas).toBe(2.5); // 2500 / 1000
    expect(metrics.ctr).toBe(2.0); // (1000 / 50000) * 100
    expect(metrics.cpc).toBe(1.0); // 1000 / 1000
    expect(metrics.cpa).toBe(20.0); // 1000 / 50
    expect(metrics.cpl).toBe(10.0); // 1000 / 100
    expect(metrics.conversion_rate).toBe(5.0); // (50 / 1000) * 100
  });

  it('handles zero divisions gracefully without throwing or NaN', () => {
    const zeros = {
      spend: 0,
      revenue: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      leads: 0,
    };

    const metrics = deriveMetricsFromTotals(zeros);

    expect(metrics.roas).toBe(0.0);
    expect(metrics.ctr).toBe(0.0);
    expect(metrics.cpc).toBe(0.0);
    expect(metrics.cpa).toBe(0.0);
    expect(metrics.cpl).toBe(0.0);
    expect(metrics.conversion_rate).toBe(0.0);
  });

  it('aggregates multi-record arrays before calculating derived rates', () => {
    const records = [
      { spend: 200, revenue: 400, impressions: 10000, clicks: 200, conversions: 10, leads: 20 },
      { spend: 300, revenue: 900, impressions: 15000, clicks: 300, conversions: 15, leads: 30 },
    ];

    const metrics = calculateMetrics(records);

    expect(metrics.spend).toBe(500);
    expect(metrics.revenue).toBe(1300);
    expect(metrics.roas).toBe(2.6); // 1300 / 500
    expect(metrics.ctr).toBe(2.0); // (500 / 25000) * 100
  });

  it('detects statistical outliers using population Z-score', () => {
    const values = [1.0, 1.1, 1.05, 0.98, 1.02, 5.0]; // 5.0 is an outlier
    const res = detectAnomalies(values, 2.0);

    expect(res.anomalies.length).toBe(1);
    expect(res.anomalies[0].value).toBe(5.0);
    expect(res.anomalies[0].z_score).toBeGreaterThan(2.0);
  });

  it('formats currencies, percentages, and multipliers properly', () => {
    expect(formatCurrency(1250.5)).toBe('$1,250.50');
    expect(formatPercent(12.345)).toBe('12.35%');
    expect(formatPercent(5.2, true)).toBe('+5.20%');
    expect(formatMultiplier(2.156)).toBe('2.16x');
  });
});
