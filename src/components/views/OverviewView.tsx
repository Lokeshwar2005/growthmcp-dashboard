import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
} from 'recharts';
import { KPICard } from '../common/KPICard';
import { DemoBadge } from '../common/DemoBadge';
import { DEMO_CAMPAIGNS, DEMO_DAILY_PERFORMANCE } from '../../data/demoData';
import { formatCurrency, formatPercent, formatMultiplier, formatNumber } from '../../services/metricsEngine';

export const OverviewView: React.FC = () => {
  // Aggregate KPIs
  const totalSpend = DEMO_CAMPAIGNS.reduce((acc, c) => acc + c.spend, 0);
  const totalRevenue = DEMO_CAMPAIGNS.reduce((acc, c) => acc + c.revenue, 0);
  const totalImpressions = DEMO_CAMPAIGNS.reduce((acc, c) => acc + c.impressions, 0);
  const totalClicks = DEMO_CAMPAIGNS.reduce((acc, c) => acc + c.clicks, 0);
  const totalLeads = DEMO_CAMPAIGNS.reduce((acc, c) => acc + c.leads, 0);
  const totalConversions = DEMO_CAMPAIGNS.reduce((acc, c) => acc + c.conversions, 0);

  const aggregateRoas = totalRevenue / totalSpend;
  const aggregateCtr = (totalClicks / totalImpressions) * 100;
  const aggregateCpl = totalSpend / totalLeads;
  const aggregateCvr = (totalConversions / totalClicks) * 100;

  // Platform Breakdown
  const platformSummary = [
    { platform: 'Meta Ads', spend: 15470.50, revenue: 27911.88, roas: 1.80, share: 63.8 },
    { platform: 'Google Ads', spend: 6050.00, revenue: 18540.00, roas: 3.06, share: 25.0 },
    { platform: 'TikTok Ads', spend: 1950.00, revenue: 2145.00, roas: 1.10, share: 11.2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Growth Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor acquisition efficiency, revenue contribution, and growth drivers across paid channels.
        </p>
      </div>

      <DemoBadge />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Ad Spend"
          value={formatCurrency(totalSpend)}
          changePct={+12.4}
          comparisonLabel="vs prior 7 days ($21.5k)"
          subtitle="Budget pacing: 98%"
        />
        <KPICard
          title="Gross Ad Revenue"
          value={formatCurrency(totalRevenue)}
          changePct={-8.2}
          comparisonLabel="vs prior 7 days ($43.7k)"
          subtitle="Blended 1.66x"
        />
        <KPICard
          title="Blended ROAS"
          value={formatMultiplier(aggregateRoas)}
          changePct={-18.3}
          comparisonLabel="vs prior 7 days (2.03x)"
          subtitle="Target: 2.20x"
        />
        <KPICard
          title="Qualified Leads"
          value={formatNumber(totalLeads)}
          changePct={+6.8}
          comparisonLabel="vs prior 7 days (2,715)"
          subtitle="Top: Meta DPA"
        />
        <KPICard
          title="Conversions"
          value={formatNumber(totalConversions)}
          changePct={-4.5}
          comparisonLabel="vs prior 7 days (1,050)"
          subtitle="Purchases"
        />
        <KPICard
          title="Blended CPL"
          value={formatCurrency(aggregateCpl)}
          changePct={+5.2}
          comparisonLabel="vs prior 7 days ($7.94)"
          inverted
          subtitle="Lead efficiency"
        />
        <KPICard
          title="Click-Through Rate (CTR)"
          value={formatPercent(aggregateCtr)}
          changePct={-3.1}
          comparisonLabel="vs prior 7 days (1.99%)"
          subtitle="Aggregate link CTR"
        />
        <KPICard
          title="Conversion Rate (CVR)"
          value={formatPercent(aggregateCvr)}
          changePct={-7.6}
          comparisonLabel="vs prior 7 days (5.10%)"
          subtitle="Purchase / click"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend vs Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Spend vs. Revenue Pace</h2>
              <p className="text-xs text-slate-500">Daily investment against attributed gross revenue</p>
            </div>
            <div className="text-xs font-mono text-slate-500">7-Day Trajectory</div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={DEMO_DAILY_PERFORMANCE}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#94A3B8"
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any) => formatCurrency(Number(val) || 0)}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="spend" name="Ad Spend" fill="#94A3B8" opacity={0.6} radius={[4, 4, 0, 0]} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#4F46E5" fill="#EEF2FF" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROAS Trend Line Chart */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">ROAS Compression</h2>
              <p className="text-xs text-slate-500">Daily return on ad spend metric</p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200">
              -45.5%
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={DEMO_DAILY_PERFORMANCE}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <YAxis domain={[0.8, 2.5]} tick={{ fontSize: 11 }} stroke="#94A3B8" tickFormatter={(v) => `${v.toFixed(1)}x`} />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any) => `${(Number(val) || 0).toFixed(2)}x`}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="roas"
                  name="ROAS"
                  stroke="#E11D48"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#E11D48' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Platform & Funnel Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Share Table */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Platform Efficiency Breakdown</h2>
          <div className="space-y-4">
            {platformSummary.map((p) => (
              <div key={p.platform} className="p-3 bg-slate-50 rounded-md border border-slate-200">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900 mb-1">
                  <span>{p.platform}</span>
                  <span className="font-mono text-indigo-700">{formatMultiplier(p.roas)} ROAS</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${p.share}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Spend: {formatCurrency(p.spend, true)}</span>
                  <span>Rev: {formatCurrency(p.revenue, true)}</span>
                  <span>{p.share}% share</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Acquisition Funnel Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Acquisition Conversion Funnel</h2>
              <p className="text-xs text-slate-500">Cross-channel aggregate stage progression</p>
            </div>
            <span className="text-xs font-mono text-slate-500">Blended Rates</span>
          </div>

          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-indigo-50/60 rounded-md border border-indigo-100">
              <span className="text-[11px] font-semibold text-indigo-700 uppercase">Impressions</span>
              <div className="text-lg font-bold text-slate-900 font-mono mt-1">1.29M</div>
              <span className="text-[10px] text-slate-500">100% Top of Funnel</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-600 uppercase">Clicks</span>
              <div className="text-lg font-bold text-slate-900 font-mono mt-1">21.3k</div>
              <span className="text-[10px] text-emerald-700 font-semibold">1.93% CTR</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-600 uppercase">Leads</span>
              <div className="text-lg font-bold text-slate-900 font-mono mt-1">2,900</div>
              <span className="text-[10px] text-indigo-700 font-semibold">13.6% Click-to-Lead</span>
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-md border border-emerald-100">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase">Purchases</span>
              <div className="text-lg font-bold text-slate-900 font-mono mt-1">1,003</div>
              <span className="text-[10px] text-emerald-800 font-semibold">4.71% CVR</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              <span className="font-semibold text-slate-700">FastMCP Insight:</span> Conversion drop-off is concentrated in TopFunnel Reels where CTR declined from 2.1% to 1.6%.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
