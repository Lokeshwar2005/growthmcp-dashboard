import React from 'react';
import { X, SearchCheck, Layers } from 'lucide-react';
import type { CampaignItem } from '../../types/analytics';
import { formatCurrency, formatPercent, formatMultiplier, formatNumber } from '../../services/metricsEngine';

interface CampaignDetailModalProps {
  campaign: CampaignItem;
  onClose: () => void;
  onRunInvestigation: (campaignName: string) => void;
}

export const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({
  campaign,
  onClose,
  onRunInvestigation,
}) => {
  // Deterministic mock adset breakdown for the modal
  const adsets = [
    { name: `${campaign.name} — Lookalike 1% High LTV`, spend: campaign.spend * 0.45, revenue: campaign.revenue * 0.52, roas: (campaign.revenue * 0.52) / (campaign.spend * 0.45), ctr: campaign.ctr * 1.15 },
    { name: `${campaign.name} — Broad Demographics (25-45)`, spend: campaign.spend * 0.35, revenue: campaign.revenue * 0.31, roas: (campaign.revenue * 0.31) / (campaign.spend * 0.35), ctr: campaign.ctr * 0.90 },
    { name: `${campaign.name} — Interest Targeting (Tech/SaaS)`, spend: campaign.spend * 0.20, revenue: campaign.revenue * 0.17, roas: (campaign.revenue * 0.17) / (campaign.spend * 0.20), ctr: campaign.ctr * 0.85 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-200 text-slate-800">
                {campaign.platform}
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                campaign.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {campaign.status}
              </span>
              <span className="text-xs text-slate-400 font-mono">{campaign.id}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">{campaign.name}</h2>
            <p className="text-xs text-slate-500">Objective: {campaign.objective} • Daily Budget: {formatCurrency(campaign.daily_budget)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500">Spend</span>
              <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">{formatCurrency(campaign.spend)}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500">Revenue</span>
              <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">{formatCurrency(campaign.revenue)}</div>
            </div>
            <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100">
              <span className="text-[11px] font-medium text-indigo-700">ROAS</span>
              <div className="text-lg font-bold text-indigo-900 font-mono mt-0.5">{formatMultiplier(campaign.roas)}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500">Conversions / CPA</span>
              <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">{formatNumber(campaign.conversions)} <span className="text-xs font-normal text-slate-500">({formatCurrency(campaign.cpa)})</span></div>
            </div>
          </div>

          {/* Investigation Trigger Banner */}
          <div className="p-4 bg-indigo-950 text-indigo-100 rounded-lg border border-indigo-800 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <SearchCheck className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-sm text-white">Investigate Campaign with GrowthMCP</span>
              </div>
              <p className="text-xs text-indigo-300 mt-0.5">
                Decompose ROAS drivers, inspect creative drift, and generate auditable evidence packets.
              </p>
            </div>
            <button
              onClick={() => onRunInvestigation(campaign.name)}
              className="px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition"
            >
              Run Investigation
            </button>
          </div>

          {/* Ad Sets Breakdown Table */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Layers className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-900">Ad Set Delivery Breakdown</h3>
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Ad Set Name</th>
                    <th className="px-4 py-2.5 text-right">Spend</th>
                    <th className="px-4 py-2.5 text-right">Revenue</th>
                    <th className="px-4 py-2.5 text-right">ROAS</th>
                    <th className="px-4 py-2.5 text-right">CTR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-mono">
                  {adsets.map((adset, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="px-4 py-2.5 font-sans font-medium text-slate-900">{adset.name}</td>
                      <td className="px-4 py-2.5 text-right">{formatCurrency(adset.spend)}</td>
                      <td className="px-4 py-2.5 text-right">{formatCurrency(adset.revenue)}</td>
                      <td className="px-4 py-2.5 text-right text-indigo-700 font-bold">{formatMultiplier(adset.roas)}</td>
                      <td className="px-4 py-2.5 text-right">{formatPercent(adset.ctr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit & Diagnostic Evidence */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <span className="font-semibold text-slate-800 uppercase tracking-wider text-[10px]">Evidence Metadata:</span>
            <p>• Data Source: {campaign.platform} Ads via GrowthMCP canonical records.</p>
            <p>• Action Array Canonicalization: Conversion and lead actions mapped to canonical schemas without double-counting rollups.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition"
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  );
};
