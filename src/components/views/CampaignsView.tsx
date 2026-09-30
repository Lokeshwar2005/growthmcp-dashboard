import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import type { CampaignItem } from '../../types/analytics';
import { formatCurrency, formatPercent, formatMultiplier, formatNumber } from '../../services/metricsEngine';
import { CampaignDetailModal } from './CampaignDetailModal';

import { useAnalytics } from '../../services/analyticsContext';

interface CampaignsViewProps {
  onInvestigateCampaign: (campaignName: string) => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({ onInvestigateCampaign }) => {
  const { campaigns, mode, selectedAccountId, setMode } = useAnalytics();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [sortField, setSortField] = useState<keyof CampaignItem>('spend');
  const [sortAsc, setSortAsc] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<CampaignItem | null>(null);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlatform = selectedPlatform === 'All' || c.platform === selectedPlatform;
      return matchesSearch && matchesPlatform;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [campaigns, searchTerm, selectedPlatform, sortField, sortAsc]);

  const handleSort = (field: keyof CampaignItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Campaign Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Enterprise multi-channel delivery table with canonical metric normalization.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
          <span>{filteredCampaigns.length} Active Campaigns</span>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search campaigns by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Platform:</span>
          {['All', 'Meta', 'Google', 'TikTok'].map((platform) => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                selectedPlatform === platform
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      {/* Dense Enterprise Table */}
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 cursor-pointer hover:text-slate-900" onClick={() => handleSort('name')}>
                  <div className="flex items-center space-x-1">
                    <span>Campaign</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-3 py-3">Platform</th>
                <th className="px-3 py-3 text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('spend')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Spend</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-3 py-3 text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('revenue')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Revenue</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-3 py-3 text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('roas')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>ROAS</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-3 py-3 text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('clicks')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Clicks</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-3 py-3 text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('ctr')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>CTR</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-3 py-3 text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('leads')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Leads</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-3 py-3 text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('cpl')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>CPL</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-3 py-3 text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('conversions')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Conv</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-3 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-slate-500 text-xs">
                    {mode === 'live' && campaigns.length === 0 ? (
                      <div className="py-4 space-y-2">
                        <p className="font-semibold text-slate-700">No active campaigns in Meta ad account {selectedAccountId}</p>
                        <p className="text-slate-400">GrowthMCP found zero campaigns for this account. You can select another account in the header or switch to Demo Mode.</p>
                        <button
                          onClick={() => setMode('demo')}
                          className="mt-2 px-3 py-1 bg-white border border-slate-300 rounded text-indigo-600 font-semibold hover:bg-slate-50 transition cursor-pointer"
                        >
                          Switch to Demo Mode
                        </button>
                      </div>
                    ) : (
                      `No campaigns found matching "${searchTerm}"${selectedPlatform !== 'All' ? ` on ${selectedPlatform}` : ''}.`
                    )}
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((camp) => (
                  <tr
                    key={camp.id}
                    onClick={() => setActiveCampaign(camp)}
                    className="hover:bg-indigo-50/40 cursor-pointer transition"
                  >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <div className="font-semibold text-xs leading-snug">{camp.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{camp.id} • {camp.objective}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {camp.platform}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-medium">{formatCurrency(camp.spend)}</td>
                  <td className="px-3 py-3 text-right font-mono font-medium">{formatCurrency(camp.revenue)}</td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-indigo-700">
                    {formatMultiplier(camp.roas)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono">{formatNumber(camp.clicks)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatPercent(camp.ctr)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatNumber(camp.leads)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatCurrency(camp.cpl)}</td>
                  <td className="px-3 py-3 text-right font-mono font-medium">{formatNumber(camp.conversions)}</td>
                  <td className="px-3 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        camp.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : camp.status === 'Budget Constrained'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {camp.status}
                    </span>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Detail Modal */}
      {activeCampaign && (
        <CampaignDetailModal
          campaign={activeCampaign}
          onClose={() => setActiveCampaign(null)}
          onRunInvestigation={(name) => {
            setActiveCampaign(null);
            onInvestigateCampaign(name);
          }}
        />
      )}
    </div>
  );
};
