import { describe, it, expect } from 'vitest';
import { investigateGrowthIssue, detectInvestigationMetric } from '../services/investigationEngine';
import { DEMO_INVESTIGATION_CURRENT_PERIOD, DEMO_INVESTIGATION_PREVIOUS_PERIOD } from '../data/demoData';

describe('Growth Investigation Engine', () => {
  it('detects the intended target metric from user phrasing', () => {
    expect(detectInvestigationMetric('Why did ROAS drop?')).toBe('roas');
    expect(detectInvestigationMetric('What drove the CPL increase?')).toBe('cpl');
    expect(detectInvestigationMetric('Why is CTR declining?')).toBe('ctr');
    expect(detectInvestigationMetric('Analyze cost per acquisition change')).toBe('cpa');
  });

  it('runs deterministic driver decomposition over period datasets', () => {
    const res = investigateGrowthIssue(
      'Why did ROAS drop?',
      DEMO_INVESTIGATION_CURRENT_PERIOD,
      DEMO_INVESTIGATION_PREVIOUS_PERIOD
    );

    expect(res.target_metric).toBe('roas');
    expect(res.drivers.length).toBe(2); // revenue & spend
    expect(res.drivers.map(d => d.component)).toContain('revenue');
    expect(res.drivers.map(d => d.component)).toContain('spend');

    // Baseline was higher ROAS, so change_pct must be negative
    expect(res.target_delta.change_pct).toBeLessThan(0);
    expect(res.breakdowns.campaign.length).toBeGreaterThan(0);
    expect(res.limitations.length).toBe(3);
  });
});
