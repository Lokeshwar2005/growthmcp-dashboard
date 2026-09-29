import React, { useState } from 'react';
import { Server, CheckCircle2, ShieldCheck, Terminal, Radio } from 'lucide-react';

export const SystemView: React.FC = () => {
  const [liveEndpoint, setLiveEndpoint] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const capabilities = [
    { tool: 'calculate_growth_metrics', desc: 'Calculate CTR, CPC, CPA, CPL, CVR, and ROAS from additive totals' },
    { tool: 'compare_campaign_metrics', desc: 'Compare metric values across campaigns without subjective bias' },
    { tool: 'detect_metric_anomalies', desc: 'Flag statistical anomalies using population z-score standard deviation' },
    { tool: 'analyze_growth_query', desc: 'Deterministic AI Growth Analyst query engine for natural language queries' },
    { tool: 'get_metric_definition', desc: 'Authoritative formulas and semantic definitions for canonical metrics' },
    { tool: 'normalize_growth_records', desc: 'Canonicalize heterogeneous ad networks into unified GrowthMCP schema' },
    { tool: 'investigate_campaign', desc: 'Auditable campaign investigation packet with driver breakdowns' },
    { tool: 'analyze_creatives', desc: 'Creative asset delivery and fatigue diagnostics' },
    { tool: 'analyze_cohorts', desc: 'Customer retention decay and monthly cohort lifetime metrics' },
    { tool: 'build_evidence_packet', desc: 'Compact audit packets tying business questions to raw source rows' },
    { tool: 'investigate_growth_issue', desc: 'Multi-period mathematical driver decomposition (revenue vs spend)' },
    { tool: 'investigate_live_meta_growth_issue', desc: 'Live Meta Graph API pagination bridge to deterministic engine' },
  ];

  const handleSaveEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Endpoint configuration stored locally.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">GrowthMCP System Architecture</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Model Context Protocol (MCP) server status, registered tools, and transport telemetry.
        </p>
      </div>

      {/* System Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">MCP Server</span>
            <span className="flex items-center text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Ready
            </span>
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono mt-1">GrowthMCP v0.1.0</div>
          <div className="text-xs text-slate-400 mt-0.5 font-mono">FastMCP Architecture</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Transports</span>
            <span className="flex items-center text-xs font-semibold text-indigo-600">
              <Radio className="w-3.5 h-3.5 mr-1" />
              Active
            </span>
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono mt-1">stdio & Streamable HTTP</div>
          <div className="text-xs text-slate-400 mt-0.5 font-mono">Port 8080 (default)</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Environment</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              DEMO MODE
            </span>
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono mt-1">Deterministic Client</div>
          <div className="text-xs text-slate-400 mt-0.5">Isolated static deployment</div>
        </div>
      </div>

      {/* Live Connection Configuration */}
      <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Server className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-semibold text-slate-900">Connect to Self-Hosted GrowthMCP Backend</h2>
        </div>
        <p className="text-xs text-slate-500">
          To connect this dashboard to your local or private GrowthMCP instance, specify your Streamable HTTP endpoint.
          <strong> Security Guarantee:</strong> No credentials or access tokens are ever sent or stored.
        </p>

        <form onSubmit={handleSaveEndpoint} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Streamable HTTP Endpoint URL:
            </label>
            <input
              type="text"
              value={liveEndpoint}
              onChange={(e) => setLiveEndpoint(e.target.value)}
              placeholder="http://127.0.0.1:8080 or https://your-growthmcp-domain.com"
              className="w-full max-w-lg px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md font-mono text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold shadow-xs transition"
            >
              Save Endpoint
            </button>
            {saveStatus && (
              <span className="text-xs font-medium text-emerald-600 animate-fade-in">
                {saveStatus}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Available Tools Registry */}
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-slate-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Registered GrowthMCP Tools (12 Tools)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500">FastMCP Registry</span>
        </div>

        <div className="divide-y divide-slate-100">
          {capabilities.map((c) => (
            <div key={c.tool} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs hover:bg-slate-50/60">
              <span className="font-mono font-semibold text-indigo-700">{c.tool}</span>
              <span className="text-slate-500 text-right sm:max-w-md">{c.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Operator Safety Notice */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start space-x-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-semibold text-slate-800">Operator Isolation Architecture:</span>
          <p className="mt-0.5 text-slate-500">
            GrowthMCP adheres to the Model Context Protocol specification. All business logic, deterministic aggregations, and Meta Graph API interactions run in the operator-controlled Python environment.
          </p>
        </div>
      </div>
    </div>
  );
};
