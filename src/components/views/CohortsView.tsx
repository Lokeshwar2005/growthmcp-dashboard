import React from 'react';
import { DEMO_COHORTS } from '../../data/demoData';
import { formatCurrency, formatNumber } from '../../services/metricsEngine';

export const CohortsView: React.FC = () => {
  const months = ['Month 0', 'Month 1', 'Month 2', 'Month 3', 'Month 4'];

  const getHeatmapColor = (retentionPct?: number) => {
    if (retentionPct === undefined) return 'bg-slate-50 text-slate-400';
    if (retentionPct >= 90) return 'bg-indigo-600 text-white font-bold';
    if (retentionPct >= 45) return 'bg-indigo-500/80 text-white font-semibold';
    if (retentionPct >= 35) return 'bg-indigo-400/60 text-slate-900 font-medium';
    if (retentionPct >= 28) return 'bg-indigo-200/60 text-indigo-950 font-medium';
    return 'bg-indigo-100/50 text-indigo-900';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Cohort Retention & LTV</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Deterministic acquisition month cohorts, customer retention decay, and cumulative lifetime value (LTV).
        </p>
      </div>

      {/* Cohort Heatmap Table */}
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Cohort Month</th>
                <th className="px-3 py-3 text-right">Users</th>
                <th className="px-3 py-3 text-right">Gross Rev</th>
                <th className="px-3 py-3 text-right">LTV</th>
                {months.map((m) => (
                  <th key={m} className="px-4 py-3 text-center">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
              {DEMO_COHORTS.map((row) => (
                <tr key={row.cohort} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-sans font-semibold text-slate-900">{row.cohort}</td>
                  <td className="px-3 py-3 text-right font-medium">{formatNumber(row.cohort_users)}</td>
                  <td className="px-3 py-3 text-right font-medium">{formatCurrency(row.revenue)}</td>
                  <td className="px-3 py-3 text-right font-bold text-indigo-700">{formatCurrency(row.ltv)}</td>
                  {months.map((_, idx) => {
                    const monthKey = `month_${idx}`;
                    const ret = row.retention[monthKey];
                    return (
                      <td key={monthKey} className="px-1 py-1.5 text-center">
                        {ret ? (
                          <div
                            className={`py-1.5 px-2 rounded text-xs transition ${getHeatmapColor(
                              ret.retention_pct
                            )}`}
                          >
                            <span>{ret.retention_pct.toFixed(0)}%</span>
                            <span className="block text-[9px] opacity-75">{ret.active_users}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 font-mono text-xs">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cohort Insight Box */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
        <span className="font-semibold text-slate-800 uppercase tracking-wider text-[10px]">Cohort Diagnostics:</span>
        <p>• Earliest event month is assigned as customer acquisition cohort (matching GrowthMCP `analyze_cohorts` tool).</p>
        <p>• Retention curve flattens around Month 3 at ~29%, indicating stable baseline product-market fit with positive LTV expansion.</p>
      </div>
    </div>
  );
};
