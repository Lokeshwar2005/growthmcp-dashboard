import React, { useState } from 'react';
import { Calendar, RefreshCw, ChevronDown, Database } from 'lucide-react';

interface TopBarProps {
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  dateRange,
  onDateRangeChange,
  onRefresh,
  isRefreshing,
}) => {
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const dateOptions = [
    'Last 7 Days (Sep 14 – Sep 20)',
    'Last 14 Days (Sep 07 – Sep 20)',
    'Last 30 Days (Aug 22 – Sep 20)',
    'Month-to-Date (September 2026)',
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Workspace & Account */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700">
            AG
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900 leading-tight">Acme Growth D2C</div>
            <div className="text-[11px] text-slate-500 font-mono">act_2325766324921047</div>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-slate-200" />

        {/* Data Source Badge */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs border border-slate-200">
          <Database className="w-3 h-3 text-slate-500" />
          <span className="font-medium">Meta Insights</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>

        {/* Demo Mode Badge */}
        <div className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-semibold tracking-wider border border-amber-200">
          DEMO MODE
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Date Selector */}
        <div className="relative">
          <button
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{dateRange}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showDateDropdown && (
            <div className="absolute right-0 mt-1 w-60 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-30">
              {dateOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onDateRangeChange(opt);
                    setShowDateDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition ${
                    dateRange === opt
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 rounded-md border border-slate-300 hover:bg-slate-50 text-slate-600 transition disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
        </button>

        {/* GitHub Link */}
        <a
          href="https://github.com/Lokeshwar2005/ai-growth-analytics-mcp"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          <span>GrowthMCP Repo</span>
        </a>
      </div>
    </header>
  );
};
