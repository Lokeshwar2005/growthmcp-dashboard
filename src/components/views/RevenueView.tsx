import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { DollarSign, ArrowRight } from 'lucide-react';
import { DEMO_CAMPAIGNS } from '../../data/demoData';
import { formatCurrency, formatMultiplier } from '../../services/metricsEngine';

export const RevenueView: React.FC = () => {
  const totalRevenue = DEMO_CAMPAIGNS.reduce((acc, c) => acc + c.revenue, 0);
  const totalSpend = DEMO_CAMPAIGNS.reduce((acc, c) => acc + c.spend, 0);
  const totalConversions = DEMO_CAMPAIGNS.reduce((acc, c) => acc + c.conversions, 0);
  const aggregateRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  const campaignRevenueData = DEMO_CAMPAIGNS.map((c) => ({
    name: c.name.length > 25 ? `${c.name.substring(0, 22)}...` : c.name,
    revenue: c.revenue,
    spend: c.spend,
    roas: c.roas,
  })).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Revenue Contribution</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Gross customer revenue breakdown, channel attribution models, and capital efficiency.
        </p>
      </div>

      {/* Attribution Model Label */}
      <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-md flex items-center justify-between text-xs text-indigo-900">
        <div>
          <span className="font-bold">Attribution Model:</span> Demo attribution model (7-day click / 1-day view canonical conversion attribution).
        </div>
        <span className="text-[11px] font-mono text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
          Last-Touch Canonical
        </span>
      </div>

      {/* Flow Card: Spend -> Conversions -> Revenue */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
          Capital-to-Revenue Progression Flow
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-center sm:text-left">
            <span className="text-xs text-slate-500">Total Ad Capital</span>
            <div className="text-2xl font-bold text-slate-900 font-mono mt-0.5">{formatCurrency(totalSpend)}</div>
            <span className="text-[11px] text-slate-400">Deployed Spend</span>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-400 hidden sm:block" />

          <div className="text-center">
            <span className="text-xs text-slate-500">Orders / Purchases</span>
            <div className="text-2xl font-bold text-slate-900 font-mono mt-0.5">{totalConversions}</div>
            <span className="text-[11px] text-slate-400">Avg AOV: {totalConversions > 0 ? formatCurrency(totalRevenue / totalConversions) : '$0.00'}</span>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-400 hidden sm:block" />

          <div className="text-center sm:text-right">
            <span className="text-xs text-slate-500">Attributed Gross Revenue</span>
            <div className="text-2xl font-bold text-emerald-700 font-mono mt-0.5">{formatCurrency(totalRevenue)}</div>
            <span className="text-[11px] text-emerald-800 font-semibold">{formatMultiplier(aggregateRoas)} Net Return</span>
          </div>
        </div>
      </div>

      {/* Revenue by Campaign Chart */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-slate-900">Revenue Generation by Campaign</h2>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={campaignRevenueData} layout="vertical" margin={{ left: 80, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
              <XAxis type="number" tickFormatter={(val) => `$${val}`} stroke="#94A3B8" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" stroke="#94A3B8" tick={{ fontSize: 11 }} width={120} />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(val: any) => formatCurrency(Number(val) || 0)}
                contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
              />
              <Bar dataKey="revenue" name="Revenue" fill="#4F46E5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
