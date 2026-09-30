import React, { useState } from 'react';
import { Calendar, RefreshCw, ChevronDown, Database, AlertCircle } from 'lucide-react';
import { useAnalytics } from '../../services/analyticsContext';

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
  const {
    mode,
    setMode,
    connectionStatus,
    adAccounts,
    selectedAccountId,
    selectAccount,
    refreshData,
    isLoading,
    error,
  } = useAnalytics();

  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const dateOptions = [
    'Last 7 Days (Sep 14 – Sep 20)',
    'Last 14 Days (Sep 07 – Sep 20)',
    'Last 30 Days (Aug 22 – Sep 20)',
    'Month-to-Date (September 2026)',
  ];

  const activeAccount = adAccounts.find((a) => a.id === selectedAccountId) || {
    id: selectedAccountId,
    name: mode === 'demo' ? 'Acme Growth D2C' : `Meta Account ${selectedAccountId}`,
  };

  const handleManualRefresh = async () => {
    onRefresh();
    await refreshData();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Workspace & Account */}
      <div className="flex items-center space-x-4">
        {/* Account Display / Selector */}
        <div className="relative">
          <div
            onClick={() => adAccounts.length > 1 && setShowAccountDropdown(!showAccountDropdown)}
            className={`flex items-center space-x-2 ${
              adAccounts.length > 1 ? 'cursor-pointer hover:opacity-80' : ''
            }`}
          >
            <div className="w-7 h-7 rounded bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700">
              {activeAccount.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 leading-tight flex items-center space-x-1">
                <span>{activeAccount.name}</span>
                {adAccounts.length > 1 && <ChevronDown className="w-3 h-3 text-slate-400" />}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">{activeAccount.id}</div>
            </div>
          </div>

          {showAccountDropdown && adAccounts.length > 1 && (
            <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-30">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Meta Ad Account
              </div>
              {adAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => {
                    selectAccount(acc.id);
                    setShowAccountDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition flex flex-col ${
                    acc.id === selectedAccountId
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-medium">{acc.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{acc.id}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-4 w-[1px] bg-slate-200" />

        {/* Data Source Badge */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs border border-slate-200">
          <Database className="w-3 h-3 text-slate-500" />
          <span className="font-medium">
            {mode === 'live' ? 'GrowthMCP Streamable HTTP' : 'Multi-Channel Feed'}
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              connectionStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
        </div>

        {/* Interactive Mode Toggle Badge */}
        <div className="flex items-center space-x-2">
          {mode === 'demo' ? (
            <button
              onClick={() => setMode('live')}
              className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-semibold tracking-wider border border-amber-200 hover:bg-amber-100 transition cursor-pointer flex items-center space-x-1"
              title="Click to switch to Live Mode via GrowthMCP"
            >
              <span>DEMO MODE</span>
              <span className="text-[9px] opacity-75 font-normal ml-0.5">→ Switch Live</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5">
              {connectionStatus === 'connected' && (
                <button
                  onClick={() => setMode('demo')}
                  className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200 hover:bg-emerald-100 transition flex items-center space-x-1.5 cursor-pointer"
                  title="Connected to GrowthMCP. Click to return to Demo Mode."
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>LIVE (GROWTHMCP)</span>
                  <span className="text-[9px] opacity-75 font-normal">→ Demo</span>
                </button>
              )}

              {connectionStatus === 'connecting' && (
                <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[11px] font-semibold border border-sky-200 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
                  <span>CONNECTING...</span>
                </span>
              )}

              {(connectionStatus === 'error' || connectionStatus === 'disconnected') && (
                <button
                  onClick={() => setMode('demo')}
                  className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-semibold border border-rose-200 hover:bg-rose-100 transition flex items-center space-x-1.5 cursor-pointer"
                  title={error || 'GrowthMCP server unreachable. Click to switch back to Demo Mode.'}
                >
                  <AlertCircle className="w-3 h-3 text-rose-500" />
                  <span>OFFLINE</span>
                  <span className="text-[9px] underline ml-1">Use Demo</span>
                </button>
              )}
            </div>
          )}
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
          onClick={handleManualRefresh}
          disabled={isRefreshing || isLoading}
          className="p-1.5 rounded-md border border-slate-300 hover:bg-slate-50 text-slate-600 transition disabled:opacity-50"
          title="Refresh Data from Active Provider"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              isRefreshing || isLoading ? 'animate-spin text-indigo-600' : ''
            }`}
          />
        </button>

        {/* GitHub Link */}
        <a
          href="https://github.com/Lokeshwar2005/ai-growth-analytics-mcp"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          <span>GrowthMCP Repo</span>
        </a>
      </div>
    </header>
  );
};
