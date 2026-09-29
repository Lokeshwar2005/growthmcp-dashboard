import React from 'react';
import { Database, CheckCircle2, AlertCircle, UploadCloud } from 'lucide-react';

export const DataSourcesView: React.FC = () => {
  const sources = [
    {
      name: 'Meta Ads (Facebook & Instagram)',
      type: 'Ad Platform',
      status: 'Demo Dataset',
      statusType: 'demo',
      details: 'Deterministic synthetic records simulating Graph API insights, campaigns, and creative metrics.',
      syncTime: 'Just now',
    },
    {
      name: 'Google Ads',
      type: 'Ad Platform',
      status: 'Demo Dataset',
      statusType: 'demo',
      details: 'Normalized Search & Performance Max campaign records.',
      syncTime: 'Just now',
    },
    {
      name: 'TikTok Ads',
      type: 'Ad Platform',
      status: 'Demo Dataset',
      statusType: 'demo',
      details: 'Spark Ads & top-funnel hook video performance records.',
      syncTime: 'Just now',
    },
    {
      name: 'Google Analytics 4 (GA4)',
      type: 'Web Analytics',
      status: 'Available / Unset',
      statusType: 'disconnected',
      details: 'Cross-channel attribution and session source canonicalization.',
      syncTime: 'Not connected',
    },
    {
      name: 'Product Events (Shopify / Segment)',
      type: 'Customer Data',
      status: 'Available / Unset',
      statusType: 'disconnected',
      details: 'User acquisition dates and monthly cohort repurchase streams.',
      syncTime: 'Not connected',
    },
    {
      name: 'CSV / Data Lake Import',
      type: 'Manual Ingestion',
      status: 'Ready for Upload',
      statusType: 'ready',
      details: 'Upload raw records matching GrowthMCP canonical schema.',
      syncTime: 'Idle',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Data Sources & Connectors</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage advertising networks, product analytics streams, and MCP ingestion endpoints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((src) => (
          <div
            key={src.name}
            className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {src.type}
                </span>
                <span
                  className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                    src.statusType === 'demo'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : src.statusType === 'ready'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {src.statusType === 'demo' ? (
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                  ) : src.statusType === 'ready' ? (
                    <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-slate-400" />
                  )}
                  <span>{src.status}</span>
                </span>
              </div>

              <h2 className="text-sm font-bold text-slate-900 mt-2">{src.name}</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{src.details}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Last Synced: {src.syncTime}</span>
              {src.statusType === 'ready' ? (
                <button className="flex items-center space-x-1 text-indigo-600 font-semibold hover:text-indigo-700">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Import File</span>
                </button>
              ) : (
                <span className="font-mono text-slate-400">GrowthMCP Transport</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Security Notice */}
      <div className="p-4 bg-slate-900 text-slate-300 rounded-lg border border-slate-800 text-xs">
        <div className="flex items-center space-x-2 text-white font-semibold mb-1">
          <Database className="w-4 h-4 text-indigo-400" />
          <span>GrowthMCP Security Isolation</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          The public dashboard never stores or receives raw API credentials (such as <code>META_ACCESS_TOKEN</code> or app secrets). When connecting to a self-hosted GrowthMCP instance, authentication is handled server-side over authenticated Streamable HTTP.
        </p>
      </div>
    </div>
  );
};
