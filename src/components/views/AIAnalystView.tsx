import React, { useState } from 'react';
import { Cpu, Send, ShieldCheck, Database, Table } from 'lucide-react';
import { analyzeGrowthQuery } from '../../services/analystEngine';
import { DEMO_INVESTIGATION_CURRENT_PERIOD } from '../../data/demoData';
import { formatCurrency, formatPercent, formatMultiplier, formatNumber } from '../../services/metricsEngine';

export const AIAnalystView: React.FC = () => {
  const [query, setQuery] = useState('What is the ROAS?');
  const [result, setResult] = useState(() =>
    analyzeGrowthQuery('What is the ROAS?', DEMO_INVESTIGATION_CURRENT_PERIOD)
  );

  const samplePrompts = [
    'What is the ROAS?',
    'Show revenue by platform',
    'What is the CPL for Prospecting?',
    'What is the conversion rate?',
    'What is the total spend and clicks?',
  ];

  const handleExecute = (q: string) => {
    setQuery(q);
    const res = analyzeGrowthQuery(q, DEMO_INVESTIGATION_CURRENT_PERIOD);
    setResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-indigo-600" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900">AI Growth Analyst</h1>
        </div>
        <p className="text-sm text-slate-500 mt-0.5">
          Ask questions about acquisition, campaign efficiency, revenue, and product growth.
        </p>
      </div>

      {/* Engine Banner */}
      <div className="p-3.5 bg-slate-900 text-slate-200 rounded-lg flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            <strong className="text-white">GrowthMCP Analyst:</strong> Deterministic analytics engine. Converts natural language queries into transparent, reproducible calculations without calling external LLMs.
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
          Deterministic v0.1
        </span>
      </div>

      {/* Query Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecute(query)}
              placeholder="e.g. What is the ROAS? or What is the CPL for Prospecting?"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-900 font-medium"
            />
          </div>
          <button
            onClick={() => handleExecute(query)}
            className="flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold shadow-xs transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Query Analyst</span>
          </button>
        </div>

        {/* Example Prompt Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 font-medium">Example Prompts:</span>
          {samplePrompts.map((p) => (
            <button
              key={p}
              onClick={() => handleExecute(p)}
              className="px-2.5 py-1 rounded text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 transition"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Output Console */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        {/* Output Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-semibold text-slate-900">Analyst Response & Audit Evidence</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500">
            <span>Filter: {result.filter_applied.campaign || result.filter_applied.platform || 'All Records'}</span>
            <span>•</span>
            <span>{result.record_count} Records</span>
          </div>
        </div>

        {/* Natural Language Explanation Box */}
        <div className="p-5 border-b border-slate-200 bg-white">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Deterministic Analysis
          </div>
          <p className="text-sm font-medium text-slate-800 leading-relaxed">
            {result.explanation}
          </p>
        </div>

        {/* Derived Metric Cards */}
        <div className="p-5 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/50">
          <div className="p-3 bg-white rounded-md border border-slate-200">
            <span className="text-[11px] text-slate-500">Spend</span>
            <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
              {formatCurrency(result.metrics.spend)}
            </div>
          </div>
          <div className="p-3 bg-white rounded-md border border-slate-200">
            <span className="text-[11px] text-slate-500">Revenue</span>
            <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
              {formatCurrency(result.metrics.revenue)}
            </div>
          </div>
          <div className="p-3 bg-indigo-50/60 rounded-md border border-indigo-100">
            <span className="text-[11px] text-indigo-700 font-medium">ROAS</span>
            <div className="text-base font-bold font-mono text-indigo-900 mt-0.5">
              {formatMultiplier(result.metrics.roas)}
            </div>
          </div>
          <div className="p-3 bg-white rounded-md border border-slate-200">
            <span className="text-[11px] text-slate-500">CTR / CVR</span>
            <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
              {formatPercent(result.metrics.ctr)} / {formatPercent(result.metrics.conversion_rate)}
            </div>
          </div>
        </div>

        {/* Evidence Table */}
        <div className="p-5">
          <div className="flex items-center space-x-2 mb-3">
            <Table className="w-4 h-4 text-slate-500" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Underlying Record Evidence (Auditable Proof)
            </h2>
          </div>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Platform</th>
                  <th className="px-3 py-2.5">Campaign</th>
                  <th className="px-3 py-2.5 text-right">Spend</th>
                  <th className="px-3 py-2.5 text-right">Revenue</th>
                  <th className="px-3 py-2.5 text-right">Clicks</th>
                  <th className="px-3 py-2.5 text-right">Conversions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                {result.evidence_rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="px-3 py-2 text-slate-600">{row.date}</td>
                    <td className="px-3 py-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                        {row.platform}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-sans font-medium text-slate-900">{row.campaign_name}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(row.spend)}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(row.revenue)}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(row.clicks)}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(row.conversions)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
