import type { CanonicalRecord, GrowthMetrics, InvestigationResult, DimensionMovement } from '../types/analytics';
import { calculateMetrics } from './metricsEngine';

const METRIC_PHRASES: Record<string, string[]> = {
  roas: ['roas', 'return on ad spend'],
  cpl: ['cpl', 'cost per lead'],
  cpa: ['cpa', 'cost per acquisition', 'cost per conversion'],
  ctr: ['ctr', 'click through rate', 'click-through rate'],
  cpc: ['cpc', 'cost per click'],
  conversion_rate: ['conversion rate', 'cvr'],
  revenue: ['revenue', 'sales'],
  spend: ['spend', 'ad spend', 'cost'],
};

const DRIVER_KEYS: Record<string, string[]> = {
  roas: ['revenue', 'spend'],
  cpl: ['spend', 'leads'],
  cpa: ['spend', 'conversions'],
  ctr: ['clicks', 'impressions'],
  cpc: ['spend', 'clicks'],
  conversion_rate: ['conversions', 'clicks'],
};

export function detectInvestigationMetric(question: string): keyof GrowthMetrics {
  const q = (question || '').toLowerCase();
  for (const [metric, phrases] of Object.entries(METRIC_PHRASES)) {
    if (phrases.some(p => q.includes(p))) {
      return metric as keyof GrowthMetrics;
    }
  }
  return 'roas';
}

function calculateDelta(cur: number, prev: number) {
  const change_pct = prev !== 0 ? ((cur - prev) / prev) * 100 : null;
  return { current: cur, previous: prev, change_pct };
}

function groupRecordsBy(records: CanonicalRecord[], key: keyof CanonicalRecord): Record<string, CanonicalRecord[]> {
  const groups: Record<string, CanonicalRecord[]> = {};
  for (const r of records) {
    const val = String(r[key] || 'Unknown');
    if (!groups[val]) groups[val] = [];
    groups[val].push(r);
  }
  return groups;
}

function rankDimension(
  curRecords: CanonicalRecord[],
  prevRecords: CanonicalRecord[],
  dimension: keyof CanonicalRecord,
  metric: keyof GrowthMetrics
): DimensionMovement[] {
  const curGroups = groupRecordsBy(curRecords, dimension);
  const prevGroups = groupRecordsBy(prevRecords, dimension);

  const allKeys = Array.from(new Set([...Object.keys(curGroups), ...Object.keys(prevGroups)]));

  const ranked: DimensionMovement[] = allKeys.map(name => {
    const curList = curGroups[name] || [];
    const prevList = prevGroups[name] || [];
    const curM = calculateMetrics(curList);
    const prevM = calculateMetrics(prevList);
    const delta = calculateDelta(curM[metric], prevM[metric]);

    return {
      value: name,
      current_metrics: curM,
      previous_metrics: prevM,
      comparison: delta,
      movement_magnitude_pct: delta.change_pct !== null ? Math.abs(delta.change_pct) : null,
      current_record_count: curList.length,
      previous_record_count: prevList.length,
    };
  });

  return ranked.sort((a, b) => {
    if (a.movement_magnitude_pct === null) return 1;
    if (b.movement_magnitude_pct === null) return -1;
    return b.movement_magnitude_pct - a.movement_magnitude_pct;
  });
}

/**
 * Deterministic growth investigation engine.
 * Faithfully mirrors `growthmcp.core.investigation.investigate_growth_issue`.
 */
export function investigateGrowthIssue(
  question: string,
  currentRecords: CanonicalRecord[],
  previousRecords: CanonicalRecord[]
): InvestigationResult {
  const targetMetric = detectInvestigationMetric(question);
  const curM = calculateMetrics(currentRecords);
  const prevM = calculateMetrics(previousRecords);

  const targetDelta = calculateDelta(curM[targetMetric], prevM[targetMetric]);

  // Determine drivers
  const driverFields = DRIVER_KEYS[targetMetric] || [targetMetric];
  const drivers = driverFields.map(field => ({
    component: field,
    delta: calculateDelta(curM[field as keyof GrowthMetrics], prevM[field as keyof GrowthMetrics]),
  }));

  // Build summary text
  let summary = '';
  if (targetDelta.change_pct === null) {
    summary = `Current-period ${targetMetric.toUpperCase()} is ${curM[targetMetric].toFixed(2)}; baseline period is empty or zero.`;
  } else {
    const dir = targetDelta.change_pct > 0 ? 'increased' : targetDelta.change_pct < 0 ? 'decreased' : 'was unchanged';
    const compParts = drivers
      .filter(d => d.delta.change_pct !== null)
      .map(d => `${d.component} ${d.delta.change_pct! >= 0 ? '+' : ''}${d.delta.change_pct!.toFixed(1)}%`);
    const compText = compParts.length > 0 ? `; component movements: ${compParts.join(', ')}.` : '.';
    summary = `${targetMetric.toUpperCase()} ${dir} by ${Math.abs(targetDelta.change_pct).toFixed(1)}%${compText}`;
  }

  // Dimension rankings
  const campaignBreakdown = rankDimension(currentRecords, previousRecords, 'campaign_name', targetMetric);
  const creativeBreakdown = rankDimension(currentRecords, previousRecords, 'creative_name', targetMetric);
  const platformBreakdown = rankDimension(currentRecords, previousRecords, 'platform', targetMetric);

  return {
    question,
    target_metric: targetMetric,
    summary,
    current_metrics: curM,
    previous_metrics: prevM,
    target_delta: targetDelta,
    drivers,
    breakdowns: {
      campaign: campaignBreakdown,
      creative: creativeBreakdown,
      platform: platformBreakdown,
    },
    evidence_count: currentRecords.length + previousRecords.length,
    limitations: [
      'Only supplied records in the active date windows are analyzed.',
      'Deterministic mathematical driver decomposition (non-probabilistic).',
      'Attribution semantics reflect standard last-touch or channel-reported conversions.',
    ],
  };
}
