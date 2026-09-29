import React, { useState } from 'react';
import { Sparkles, ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';
import { DEMO_CREATIVES } from '../../data/demoData';
import { formatCurrency, formatPercent, formatMultiplier } from '../../services/metricsEngine';

export const CreativesView: React.FC = () => {
  const [filterFormat, setFilterFormat] = useState('All');

  const filteredCreatives = DEMO_CREATIVES.filter(
    (c) => filterFormat === 'All' || c.format.includes(filterFormat)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Creative Diagnostics</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Ad-level asset fatigue detection, CTR degradation, and ROAS attribution.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {['All', 'Reel', 'Video', 'Carousel', 'Static'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFilterFormat(fmt)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                filterFormat === fmt
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Top Movers vs Fatigue Warnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg">
          <div className="flex items-center space-x-2 text-emerald-800 font-semibold text-xs mb-1">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Top Performing Asset (Scaling)</span>
          </div>
          <div className="text-sm font-bold text-slate-900">Founder Story Hook - 30s High Contrast</div>
          <div className="text-xs text-slate-600 mt-1 flex items-center space-x-3 font-mono">
            <span>Spend: $3,420</span>
            <span className="text-emerald-700 font-bold">ROAS: 2.00x (+14.2%)</span>
            <span>CTR: 1.70%</span>
          </div>
        </div>

        <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-lg">
          <div className="flex items-center space-x-2 text-rose-800 font-semibold text-xs mb-1">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Creative Fatigue Alert (Needs Refresh)</span>
          </div>
          <div className="text-sm font-bold text-slate-900">UGC Unboxing & First Reaction</div>
          <div className="text-xs text-slate-600 mt-1 flex items-center space-x-3 font-mono">
            <span>Spend: $2,150</span>
            <span className="text-rose-700 font-bold">ROAS: 1.10x (-32.8%)</span>
            <span>CTR: 1.30%</span>
          </div>
        </div>
      </div>

      {/* Creative Performance Table */}
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Creative Name</th>
                <th className="px-3 py-3">Format</th>
                <th className="px-3 py-3">Associated Campaign</th>
                <th className="px-3 py-3 text-right">Spend</th>
                <th className="px-3 py-3 text-right">Revenue</th>
                <th className="px-3 py-3 text-right">ROAS</th>
                <th className="px-3 py-3 text-right">CTR</th>
                <th className="px-3 py-3 text-right">CPL</th>
                <th className="px-3 py-3 text-right">Movement</th>
                <th className="px-3 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredCreatives.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{c.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{c.id}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {c.format}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-600 truncate max-w-xs">{c.campaign_name}</td>
                  <td className="px-3 py-3 text-right font-mono font-medium">{formatCurrency(c.spend)}</td>
                  <td className="px-3 py-3 text-right font-mono font-medium">{formatCurrency(c.revenue)}</td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-indigo-700">{formatMultiplier(c.roas)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatPercent(c.ctr)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatCurrency(c.cpl)}</td>
                  <td className="px-3 py-3 text-right font-mono font-semibold">
                    <span className={`inline-flex items-center space-x-0.5 ${c.movement_pct >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {c.movement_pct >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      <span>{c.movement_pct >= 0 ? '+' : ''}{c.movement_pct.toFixed(1)}%</span>
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                      c.status === 'Scaling'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : c.status === 'Fatigued'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
