import React, { useState } from 'react';
import { SearchCheck, ArrowDownRight, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { investigateGrowthIssue } from '../../services/investigationEngine';
import { DEMO_INVESTIGATION_CURRENT_PERIOD, DEMO_INVESTIGATION_PREVIOUS_PERIOD } from '../../data/demoData';
import { formatCurrency, formatMultiplier } from '../../services/metricsEngine';
import { formatMetricValue } from '../../services/analystEngine';

import { useAnalytics } from '../../services/analyticsContext';

interface InvestigationsViewProps {
  initialQuestion?: string;
}

export const InvestigationsView: React.FC<InvestigationsViewProps> = ({ initialQuestion }) => {
  const { provider, selectedAccountId } = useAnalytics();
  const [question, setQuestion] = useState(initialQuestion || 'Why did ROAS drop?');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(() =>
    investigateGrowthIssue(
      initialQuestion || 'Why did ROAS drop?',
      DEMO_INVESTIGATION_CURRENT_PERIOD,
      DEMO_INVESTIGATION_PREVIOUS_PERIOD
    )
  );

  const [prevInitial, setPrevInitial] = useState(initialQuestion);

  if (initialQuestion && initialQuestion !== prevInitial) {
    setPrevInitial(initialQuestion);
    setQuestion(initialQuestion);
    setResult(
      investigateGrowthIssue(
        initialQuestion,
        DEMO_INVESTIGATION_CURRENT_PERIOD,
        DEMO_INVESTIGATION_PREVIOUS_PERIOD
      )
    );
  }

  const presetQuestions = [
    'Why did ROAS drop?',
    'Why did CPL increase?',
    'Why did CTR decline?',
    'Which campaigns drove the change?',
    'Why did CPA increase?',
  ];

  const handleRun = async (q: string) => {
    setQuestion(q);
    setIsRunning(true);
    try {
      const res = await provider.runInvestigation(q, selectedAccountId);
      setResult(res);
    } catch (err) {
      console.warn('Investigation live call error, using local fallback:', err);
      const res = investigateGrowthIssue(
        q,
        DEMO_INVESTIGATION_CURRENT_PERIOD,
        DEMO_INVESTIGATION_PREVIOUS_PERIOD
      );
      setResult(res);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <SearchCheck className="w-5 h-5 text-indigo-600" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Growth Issue Investigation</h1>
        </div>
        <p className="text-sm text-slate-500 mt-0.5">
          Deterministic mathematical driver decomposition & campaign drilldown via GrowthMCP workflows.
        </p>
      </div>

      {/* Query Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs space-y-3">
        <label className="block text-xs font-semibold text-slate-700">Investigation Question:</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRun(question)}
            placeholder="e.g. Why did ROAS drop? or Why did CPL increase?"
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
          />
          <button
            onClick={() => handleRun(question)}
            disabled={isRunning}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold shadow-xs transition disabled:opacity-50 flex items-center justify-center"
          >
            <span>{isRunning ? 'Running...' : 'Run Diagnostic'}</span>
          </button>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 font-medium">Quick Prompts:</span>
          {presetQuestions.map((preset) => (
            <button
              key={preset}
              onClick={() => handleRun(preset)}
              className="px-2 py-0.5 rounded text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 transition"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Investigation Results Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        {/* Top Summary Banner */}
        <div className="p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Target Metric: {result.target_metric.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {result.evidence_count} Sample Records Analyzed
              </span>
            </div>
            <div className="text-base font-bold text-white mt-1.5">{result.summary}</div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Observed Target Delta</span>
            <span
              className={`text-xl font-bold font-mono ${
                (result.target_delta.change_pct ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {(result.target_delta.change_pct ?? 0) >= 0 ? '+' : ''}
              {result.target_delta.change_pct !== null
                ? `${result.target_delta.change_pct.toFixed(1)}%`
                : 'N/A'}
            </span>
          </div>
        </div>

        {/* Period Metrics Comparison */}
        <div className="p-5 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/50">
          <div className="p-3 bg-white rounded-md border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Current Period Spend</span>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
              {formatCurrency(result.current_metrics.spend)}
            </div>
            <span className="text-[10px] text-slate-400">Baseline: {formatCurrency(result.previous_metrics.spend)}</span>
          </div>
          <div className="p-3 bg-white rounded-md border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Current Period Revenue</span>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
              {formatCurrency(result.current_metrics.revenue)}
            </div>
            <span className="text-[10px] text-slate-400">Baseline: {formatCurrency(result.previous_metrics.revenue)}</span>
          </div>
          <div className="p-3 bg-white rounded-md border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Current Period ROAS</span>
            <div className="text-base font-bold text-indigo-700 font-mono mt-0.5">
              {formatMultiplier(result.current_metrics.roas)}
            </div>
            <span className="text-[10px] text-slate-400">Baseline: {formatMultiplier(result.previous_metrics.roas)}</span>
          </div>
          <div className="p-3 bg-white rounded-md border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Conversions / CPL</span>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
              {result.current_metrics.conversions} <span className="text-xs font-normal text-slate-400">({formatCurrency(result.current_metrics.cpl)})</span>
            </div>
            <span className="text-[10px] text-slate-400">Baseline: {result.previous_metrics.conversions}</span>
          </div>
        </div>

        {/* Driver Decomposition Cards */}
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Primary Mathematical Drivers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.drivers.map((drv) => {
              const delta = drv.delta.change_pct;
              const isPos = (delta ?? 0) >= 0;
              return (
                <div key={drv.component} className="p-3.5 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 capitalize">
                      {drv.component} Component
                    </span>
                    <div className="text-xs text-slate-500 mt-0.5 font-mono">
                      Current: {drv.delta.current.toFixed(1)} vs Prev: {drv.delta.previous.toFixed(1)}
                    </div>
                  </div>
                  <div
                    className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-bold ${
                      isPos ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    <span>{isPos ? '+' : ''}{delta !== null ? `${delta.toFixed(1)}%` : '0%'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Campaign Breakdown Ranking */}
        <div className="p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Campaign Contribution & Movement Ranking
          </h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">Campaign Name</th>
                  <th className="px-3 py-2.5 text-right">Current Spend</th>
                  <th className="px-3 py-2.5 text-right">Current Revenue</th>
                  <th className="px-3 py-2.5 text-right">Current {result.target_metric.toUpperCase()}</th>
                  <th className="px-3 py-2.5 text-right">Previous {result.target_metric.toUpperCase()}</th>
                  <th className="px-3 py-2.5 text-right">Metric Movement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                {result.breakdowns.campaign.map((row) => (
                  <tr key={row.value} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 font-sans font-medium text-slate-900">{row.value}</td>
                    <td className="px-3 py-2.5 text-right">{formatCurrency(row.current_metrics.spend)}</td>
                    <td className="px-3 py-2.5 text-right">{formatCurrency(row.current_metrics.revenue)}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-indigo-700">
                      {formatMetricValue(result.target_metric, row.current_metrics[result.target_metric])}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-500">
                      {formatMetricValue(result.target_metric, row.previous_metrics[result.target_metric])}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold">
                      <span
                        className={`inline-flex items-center space-x-0.5 ${
                          (row.comparison.change_pct ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {(row.comparison.change_pct ?? 0) >= 0 ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        <span>
                          {(row.comparison.change_pct ?? 0) >= 0 ? '+' : ''}
                          {row.comparison.change_pct !== null
                            ? `${row.comparison.change_pct.toFixed(1)}%`
                            : 'N/A'}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Limitations & Audit Box */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-semibold text-slate-800">Investigation Methodology & Limitations:</span>
            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-500">
              {result.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
