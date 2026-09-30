import React from 'react';
import { ArrowDown, TrendingUp } from 'lucide-react';
import { KPICard } from '../common/KPICard';
import { DEMO_CAMPAIGNS } from '../../data/demoData';
import { calculateMetrics, formatCurrency, formatPercent, formatNumber } from '../../services/metricsEngine';

export const AcquisitionView: React.FC = () => {
  const metrics = calculateMetrics(DEMO_CAMPAIGNS);
  const {
    spend: totalSpend,
    impressions: totalImpressions,
    clicks: totalClicks,
    leads: totalLeads,
    conversions: totalConversions,
    ctr: aggregateCtr,
    cpc: aggregateCpc,
    cpl: aggregateCpl,
    cpa: aggregateCpa,
    conversion_rate: aggregateCvr,
  } = metrics;

  // Funnel steps
  const funnelSteps = [
    {
      stage: 'Top of Funnel — Impressions',
      count: totalImpressions,
      rate: '100.0%',
      subtext: 'Cross-channel paid ad delivery',
      color: 'bg-indigo-600',
    },
    {
      stage: 'Traffic — Clicks',
      count: totalClicks,
      rate: `${aggregateCtr.toFixed(2)}% CTR`,
      subtext: `Avg CPC: ${formatCurrency(aggregateCpc)}`,
      color: 'bg-indigo-500',
    },
    {
      stage: 'Intent — Qualified Leads',
      count: totalLeads,
      rate: `${totalClicks > 0 ? ((totalLeads / totalClicks) * 100).toFixed(1) : '0.0'}% of Clicks`,
      subtext: `Avg CPL: ${formatCurrency(aggregateCpl)}`,
      color: 'bg-indigo-400',
    },
    {
      stage: 'Acquisition — Customer Purchases',
      count: totalConversions,
      rate: `${aggregateCvr.toFixed(2)}% CVR`,
      subtext: `Avg CPA / CAC: ${formatCurrency(aggregateCpa)}`,
      color: 'bg-emerald-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Acquisition Efficiency</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Detailed unit economics, cost-per-result tracking, and multi-stage drop-off analytics.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KPICard title="Total Spend" value={formatCurrency(totalSpend)} changePct={+12.4} />
        <KPICard title="Impressions" value={formatNumber(totalImpressions, true)} changePct={+15.8} />
        <KPICard title="Clicks" value={formatNumber(totalClicks)} changePct={+9.2} />
        <KPICard title="CTR" value={formatPercent(aggregateCtr)} changePct={-3.1} />
        <KPICard title="CPC" value={formatCurrency(aggregateCpc)} changePct={+2.8} inverted />
        <KPICard title="Leads" value={formatNumber(totalLeads)} changePct={+6.8} />
        <KPICard title="CPL" value={formatCurrency(aggregateCpl)} changePct={+5.2} inverted />
        <KPICard title="Conversions" value={formatNumber(totalConversions)} changePct={-4.5} />
        <KPICard title="CPA (CAC)" value={formatCurrency(aggregateCpa)} changePct={+17.7} inverted />
        <KPICard title="Conv. Rate" value={formatPercent(aggregateCvr)} changePct={-7.6} />
      </div>

      {/* Funnel Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-semibold text-slate-900">Full-Funnel Conversion Waterfall</h2>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          {funnelSteps.map((step, idx) => (
            <React.Fragment key={step.stage}>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {step.stage}
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    {formatNumber(step.count)}
                  </div>
                  <div className="text-xs text-slate-500">{step.subtext}</div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-white border border-slate-200 text-indigo-700 shadow-xs">
                    {step.rate}
                  </span>
                </div>
              </div>
              {idx < funnelSteps.length - 1 && (
                <div className="flex justify-center -my-2 text-slate-400">
                  <ArrowDown className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Platform Acquisition Comparison */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Channel Acquisition Economics</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-2.5">Channel</th>
                <th className="px-4 py-2.5 text-right">Spend</th>
                <th className="px-4 py-2.5 text-right">Clicks</th>
                <th className="px-4 py-2.5 text-right">CPC</th>
                <th className="px-4 py-2.5 text-right">Leads</th>
                <th className="px-4 py-2.5 text-right">CPL</th>
                <th className="px-4 py-2.5 text-right">Purchases</th>
                <th className="px-4 py-2.5 text-right">CPA</th>
                <th className="px-4 py-2.5 text-right">CVR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
              <tr>
                <td className="px-4 py-3 font-sans font-medium text-slate-900">Meta Ads</td>
                <td className="px-4 py-3 text-right">{formatCurrency(15470.50)}</td>
                <td className="px-4 py-3 text-right">15,483</td>
                <td className="px-4 py-3 text-right">$1.00</td>
                <td className="px-4 py-3 text-right">2,008</td>
                <td className="px-4 py-3 text-right">$7.70</td>
                <td className="px-4 py-3 text-right">610</td>
                <td className="px-4 py-3 text-right">$25.36</td>
                <td className="px-4 py-3 text-right">3.94%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-medium text-slate-900">Google Ads</td>
                <td className="px-4 py-3 text-right">{formatCurrency(6050.00)}</td>
                <td className="px-4 py-3 text-right">6,000</td>
                <td className="px-4 py-3 text-right">$1.01</td>
                <td className="px-4 py-3 text-right">990</td>
                <td className="px-4 py-3 text-right">$6.11</td>
                <td className="px-4 py-3 text-right">435</td>
                <td className="px-4 py-3 text-right">$13.91</td>
                <td className="px-4 py-3 text-right">7.25%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-medium text-slate-900">TikTok Ads</td>
                <td className="px-4 py-3 text-right">{formatCurrency(1950.00)}</td>
                <td className="px-4 py-3 text-right">2,925</td>
                <td className="px-4 py-3 text-right">$0.67</td>
                <td className="px-4 py-3 text-right">290</td>
                <td className="px-4 py-3 text-right">$6.72</td>
                <td className="px-4 py-3 text-right">48</td>
                <td className="px-4 py-3 text-right">$40.63</td>
                <td className="px-4 py-3 text-right">1.64%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
