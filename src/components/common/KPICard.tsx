import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  changePct?: number | null;
  comparisonLabel?: string;
  subtitle?: string;
  inverted?: boolean; // For costs (CPA, CPL, CPC): down is good, up is bad
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  changePct,
  comparisonLabel = 'vs prev period',
  subtitle,
  inverted = false,
}) => {
  let isPositive = false;
  let isNeutral = true;

  if (changePct !== undefined && changePct !== null) {
    if (changePct > 0) {
      isPositive = !inverted;
      isNeutral = false;
    } else if (changePct < 0) {
      isPositive = inverted;
      isNeutral = false;
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs hover:border-slate-300 transition">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {changePct !== undefined && changePct !== null && (
          <div
            className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[11px] font-semibold ${
              isNeutral
                ? 'bg-slate-100 text-slate-600'
                : isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {isNeutral ? (
              <Minus className="w-3 h-3" />
            ) : changePct > 0 ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            <span>
              {changePct > 0 ? '+' : ''}
              {changePct.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-mono">
        {value}
      </div>

      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
        <span>{comparisonLabel}</span>
        {subtitle && <span className="text-slate-500 font-medium">{subtitle}</span>}
      </div>
    </div>
  );
};
