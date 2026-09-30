import { describe, it, expect } from 'vitest';
import { analyzeGrowthQuery, extractRequestedMetrics } from '../services/analystEngine';
import { DEMO_INVESTIGATION_CURRENT_PERIOD } from '../data/demoData';

describe('AI Growth Analyst Query Engine', () => {
  it('extracts single and multiple requested metrics properly', () => {
    expect(extractRequestedMetrics('What is the ROAS?')).toEqual(['roas']);
    expect(extractRequestedMetrics('Show spend and revenue')).toEqual(['spend', 'revenue']);
    expect(extractRequestedMetrics('What is the cost per lead and conversion rate?')).toEqual([
      'cpl',
      'conversion_rate',
    ]);
  });

  it('filters by platform and derives metrics deterministically', () => {
    const res = analyzeGrowthQuery('What is the ROAS for Meta?', DEMO_INVESTIGATION_CURRENT_PERIOD);

    expect(res.filter_applied.platform).toBe('Meta');
    expect(res.record_count).toBe(2); // Two Meta campaigns in the test dataset
    expect(res.metrics.roas).toBeGreaterThan(0);
    expect(res.explanation).toContain('Meta Ads');
  });

  it('filters by campaign name when present in natural language query', () => {
    const res = analyzeGrowthQuery(
      'What is the spend for Prospecting Advantage+?',
      DEMO_INVESTIGATION_CURRENT_PERIOD
    );

    expect(res.filter_applied.campaign).toBe('Prospecting Advantage+');
    expect(res.metrics.spend).toBe(7000);
  });

  it('identifies the highest-performing campaign when asked', () => {
    const res = analyzeGrowthQuery(
      'Which campaign has the highest ROAS?',
      DEMO_INVESTIGATION_CURRENT_PERIOD
    );

    expect(res.requested_metrics).toContain('roas');
    expect(res.explanation).toContain('Highest ROAS campaign is "Brand Search" at 3.00x');
  });
});
