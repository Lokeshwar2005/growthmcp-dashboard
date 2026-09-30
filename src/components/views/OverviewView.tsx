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
import { Calendar, Info } from 'lucide-react';
import { KPICard } from '../common/KPICard';
import { DemoBadge } from '../common/DemoBadge';
import { DEMO_DAILY_PERFORMANCE } from '../../data/demoData';
import { formatCurrency, formatPercent, formatMultiplier, formatNumber } from '../../services/metricsEngine';

import { useAnalytics } from '../../services/analyticsContext';

interface OverviewViewProps {
  dateRange?: string;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  dateRange = 'Last 14 Days (Sep 07 – Sep 20)',
}) => {
  const { mode, campaigns, metrics, selectedAccountId, setMode } = useAnalytics();

  // Aggregate KPIs from active dataset
  const totalSpend = metrics.spend;
  const totalRevenue = metrics.revenue;
  const totalLeads = metrics.leads;
  const totalConversions = metrics.conversions;

  const aggregateRoas = metrics.roas;
  const aggregateCtr = metrics.ctr;
  const aggregateCpl = metrics.cpl;
  const aggregateCvr = metrics.conversion_rate;

  // Platform Breakdown
  const platformSummary = React.useMemo(() => {
    if (mode === 'demo') {
      return [
        { platform: 'Meta Ads', spend: 15470.50, revenue: 27911.88, roas: 1.80, share: 63.8 },
        { platform: 'Google Ads', spend: 6050.00, revenue: 18540.00, roas: 3.06, share: 25.0 },
        { platform: 'TikTok Ads', spend: 1950.00, revenue: 2145.00, roas: 1.10, share: 11.2 },
      ];
    }
    const metaSpend = campaigns.reduce((acc, c) => acc + c.spend, 0);
    const metaRev = campaigns.reduce((acc, c) => acc + c.revenue, 0);
    const metaRoas = metaSpend > 0 ? metaRev / metaSpend : 0;
    return [
      { platform: 'Meta Ads', spend: metaSpend, revenue: metaRev, roas: metaRoas, share: 100 },
    ];
  }, [mode, campaigns]);

  // Derive explicit date context for UI clarity
  const getDateContext = (rangeStr: string) => {
    if (rangeStr.includes('14 Days') || rangeStr.includes('Sep 07')) {
      return {
        selectedWindow: 'Sep 07 – Sep 20 (14 Days)',
        currentTrend: 'Sep 14 – Sep 20 (Active 7 Days)',
        comparisonBaseline: 'Sep 07 – Sep 13 (Prior 7 Days)',
        chartLabel: '7-Day Trajectory · Sep 14–20',
        chartSublabel: 'Preceding baseline · Sep 07–13',
      };
    }
    if (rangeStr.includes('30 Days')) {
      return {
        selectedWindow: 'Aug 22 – Sep 20 (30 Days)',
        currentTrend: 'Sep 14 – Sep 20 (Latest 7 Days)',
        comparisonBaseline: 'Sep 07 – Sep 13 (Prior 7 Days)',
        chartLabel: '7-Day Trajectory · Sep 14–20',
        chartSublabel: 'Preceding baseline · Sep 07–13',
      };
    }
    if (rangeStr.includes('Month-to-Date')) {
      return {
        selectedWindow: 'Sep 01 – Sep 20 (Month-to-Date)',
        currentTrend: 'Sep 14 – Sep 20 (Latest 7 Days)',
        comparisonBaseline: 'Sep 07 – Sep 13 (Prior 7 Days)',
        chartLabel: '7-Day Trajectory · Sep 14–20',
        chartSublabel: 'Preceding baseline · Sep 07–13',
      };
    }
    return {
      selectedWindow: 'Sep 14 – Sep 20 (7 Days)',
      currentTrend: 'Sep 14 – Sep 20 (Active 7 Days)',
      comparisonBaseline: 'Sep 07 – Sep 13 (Prior 7 Days)',
      chartLabel: '7-Day Trajectory · Sep 14–20',
      chartSublabel: 'Preceding baseline · Sep 07–13',
    };
  };

  const dateCtx = getDateContext(dateRange);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Growth Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor acquisition efficiency, revenue contribution, and growth drivers across paid channels.
          </p>
        </div>
      </div>

      {mode === 'demo' ? (
        <DemoBadge />
      ) : (
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live GrowthMCP Meta Ads Stream ({selectedAccountId})</span>
        </div>
      )}

      {mode === 'live' && campaigns.length === 0 && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Empty Meta Ad Account ({selectedAccountId})</p>
              <p className="mt-0.5 text-amber-700">
                GrowthMCP successfully connected to Meta Graph API, but found no active campaigns with performance data in this account for the selected period.
              </p>
            </div>
          </div>
          <button
            onClick={() => setMode('demo')}
            className="px-3 py-1 bg-white border border-amber-300 rounded text-amber-800 font-semibold hover:bg-amber-100 transition shrink-0 cursor-pointer"
          >
            Switch to Demo Mode
          </button>
        </div>
      )}

      {/* Date Window & Trajectory Context Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 px-4 py-3 bg-white border border-slate-200 rounded-lg text-xs shadow-2xs">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <div className="flex items-center space-x-1.5 text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-semibold text-slate-900">Reporting Window:</span>
            <span className="font-mono text-indigo-700 font-semibold">{dateCtx.selectedWindow}</span>
          </div>
          <span className="text-slate-300 hidden md:inline">|</span>
          <div className="flex items-center space-x-1 text-slate-500">
            <span>Daily Trajectory:</span>
            <span className="font-mono text-slate-700 font-medium">{dateCtx.currentTrend}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-slate-500 border-t md:border-t-0 pt-1.5 md:pt-0 border-slate-100">
          <span>Baseline Comparison:</span>
          <span className="font-mono text-slate-800 font-semibold">{dateCtx.comparisonBaseline}</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Ad Spend"
          value={formatCurrency(totalSpend)}
          changePct={+12.4}
          comparisonLabel="vs prior 7 days ($21.5k)"
          subtitle="Budget pacing: 98%"
          definition="Advertising spend: Sum of spend across active campaigns."
        />
        <KPICard
          title="Gross Ad Revenue"
          value={formatCurrency(totalRevenue)}
          changePct={-8.2}
          comparisonLabel="vs prior 7 days ($43.7k)"
          subtitle="Blended 2.07x"
          definition="Attributed revenue: Sum of attributed revenue across campaigns."
        />
        <KPICard
          title="Blended ROAS"
          value={formatMultiplier(aggregateRoas)}
          changePct={-18.3}
          comparisonLabel="vs prior 7 days (2.03x)"
          subtitle="Target: 2.20x"
          definition="Return on ad spend: Attributed revenue ÷ ad spend."
        />
        <KPICard
          title="Qualified Leads"
          value={formatNumber(totalLeads)}
          changePct={+6.8}
          comparisonLabel="vs prior 7 days (2,715)"
          subtitle="Account-level records"
          definition="Leads: Sum of qualified leads acquired across campaigns."
        />
        <KPICard
          title="Conversions"
          value={formatNumber(totalConversions)}
          changePct={-4.5}
          comparisonLabel="vs prior 7 days (1,050)"
          subtitle="All campaign goals"
          definition="Conversions: Sum of conversion events across campaigns."
        />
        <KPICard
          title="Blended CPL"
          value={formatCurrency(aggregateCpl)}
          changePct={+5.2}
          comparisonLabel="vs prior 7 days ($7.94)"
          inverted
          subtitle="Cost per lead"
          definition="Cost per lead: Total ad spend ÷ leads."
        />
        <KPICard
          title="Click-Through Rate (CTR)"
          value={formatPercent(aggregateCtr)}
          changePct={-3.1}
          comparisonLabel="vs prior 7 days (1.99%)"
          subtitle="Aggregate link CTR"
          definition="Click-through rate: Clicks ÷ impressions × 100."
        />
        <KPICard
          title="Conversion Rate (CVR)"
          value={formatPercent(aggregateCvr)}
          changePct={-7.6}
          comparisonLabel="vs prior 7 days (5.10%)"
          subtitle="Conversions / click"
          definition="Conversion rate: Total conversions ÷ clicks × 100."
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend vs Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Spend vs. Revenue Pace</h2>
              <p className="text-xs text-slate-500">Daily investment against attributed gross revenue</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xs font-mono font-semibold text-slate-700">{dateCtx.chartLabel}</div>
              <div className="text-[10px] text-slate-400">{dateCtx.chartSublabel}</div>
            </div>
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
            <div className="flex items-center space-x-2">
              <div className="text-right hidden sm:block">
                <div className="text-[11px] font-mono text-slate-600 font-medium">Sep 14–20</div>
                <div className="text-[10px] text-slate-400">vs Sep 07–13</div>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                -45.5%
              </span>
            </div>
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
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Platform Efficiency Breakdown</h2>
            <span className="text-[11px] font-mono text-slate-400">Channel Share</span>
          </div>
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
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-semibold text-slate-900">Acquisition Conversion Funnel</h2>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Attributed Paid Funnel
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Paid advertising stage progression from impression to store purchase
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">Blended Stage Rates</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-indigo-50/60 rounded-md border border-indigo-100">
                <span className="text-[11px] font-semibold text-indigo-700 uppercase">1. Impressions</span>
                <div className="text-lg font-bold text-slate-900 font-mono mt-1">1.29M</div>
                <span className="text-[10px] text-slate-500">Top-of-Funnel Reach</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-600 uppercase">2. Ad Clicks</span>
                <div className="text-lg font-bold text-slate-900 font-mono mt-1">21.3k</div>
                <span className="text-[10px] text-emerald-700 font-semibold">1.93% Click Rate</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-600 uppercase">3. Attributed Leads</span>
                <div className="text-lg font-bold text-slate-900 font-mono mt-1">2,900</div>
                <span className="text-[10px] text-indigo-700 font-semibold">13.6% Click-to-Lead</span>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-md border border-emerald-100">
                <span className="text-[11px] font-semibold text-emerald-700 uppercase">4. Store Purchases</span>
                <div className="text-lg font-bold text-slate-900 font-mono mt-1">1,003</div>
                <span className="text-[10px] text-emerald-800 font-semibold">4.71% Purchase CVR</span>
              </div>
            </div>
          </div>

          {/* Explanatory Distinction Banner */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-start space-x-1.5 text-slate-600">
              <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-800">Methodology Distinction:</strong> The funnel models attributed paid acquisition events (2,900 leads → 1,003 purchases), while the KPI cards use normalized account-level totals across the selected reporting dataset (3,288 qualified leads / 1,093 conversions).
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 whitespace-nowrap pl-5 sm:pl-0">
              Reporting Scope: Paid Campaigns
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
