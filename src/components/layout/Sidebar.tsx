import React from 'react';
import {
  LayoutDashboard,
  Layers,
  TrendingUp,
  Sparkles,
  Users,
  DollarSign,
  SearchCheck,
  Cpu,
  Database,
  Server,
  Activity,
} from 'lucide-react';
import type { NavigationTab } from '../../types/analytics';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Campaigns', icon: Layers },
    { id: 'acquisition', label: 'Acquisition', icon: TrendingUp },
    { id: 'creatives', label: 'Creatives', icon: Sparkles },
    { id: 'cohorts', label: 'Cohorts', icon: Users },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'investigations', label: 'Investigations', icon: SearchCheck, badge: 'Deterministic' },
    { id: 'analyst', label: 'AI Analyst', icon: Cpu, badge: 'Core' },
    { id: 'datasources', label: 'Data Sources', icon: Database },
    { id: 'system', label: 'System / MCP', icon: Server },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 min-h-screen text-slate-300 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white tracking-tight text-base">GrowthMCP</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60">
                v0.1
              </span>
            </div>
            <div className="text-xs text-slate-400 font-medium">Growth Analytics</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Analytics Console
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-800 text-slate-400 border border-slate-700">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300">GrowthMCP Engine</span>
          <span className="flex items-center text-[11px] text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            Operational
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Self-hosted analytics server for Meta Ads & cross-channel acquisition.
        </p>
      </div>
    </aside>
  );
};
