import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { CampaignItem, GrowthMetrics } from '../types/analytics';
import type {
  AnalyticsProvider,
  AdAccountInfo,
} from './analyticsProvider';
import {
  DemoAnalyticsProvider,
  GrowthMCPProvider,
} from './analyticsProvider';
import { DEMO_CAMPAIGNS } from '../data/demoData';
import { deriveMetricsFromTotals } from './metricsEngine';

export type DashboardMode = 'demo' | 'live';
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

interface AnalyticsContextType {
  mode: DashboardMode;
  connectionStatus: ConnectionStatus;
  endpoint: string;
  provider: AnalyticsProvider;
  adAccounts: AdAccountInfo[];
  selectedAccountId: string;
  campaigns: CampaignItem[];
  metrics: GrowthMetrics;
  isLoading: boolean;
  error: string | null;
  serverDiagnostics: {
    toolsCount?: number;
    latencyMs?: number;
    sessionId?: string;
    message?: string;
    tools?: string[];
  } | null;
  setMode: (mode: DashboardMode) => void;
  setEndpoint: (endpoint: string) => void;
  selectAccount: (accountId: string) => void;
  refreshData: () => Promise<void>;
  testConnection: () => Promise<{ ok: boolean; message: string; latencyMs?: number }>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<DashboardMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('growthmcp_mode');
      if (saved === 'live' || saved === 'demo') return saved;
    }
    return 'demo';
  });

  const [endpoint, setEndpointState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('growthmcp_endpoint');
      if (saved) return saved;
    }
    return import.meta.env.VITE_GROWTHMCP_ENDPOINT || 'http://127.0.0.1:8080/mcp';
  });

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [adAccounts, setAdAccounts] = useState<AdAccountInfo[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('act_2325766324921047');
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(DEMO_CAMPAIGNS);
  const [metrics, setMetrics] = useState<GrowthMetrics>(() => {
    const totals = DEMO_CAMPAIGNS.reduce(
      (acc, c) => ({
        spend: acc.spend + c.spend,
        revenue: acc.revenue + c.revenue,
        impressions: acc.impressions + c.impressions,
        clicks: acc.clicks + c.clicks,
        conversions: acc.conversions + c.conversions,
        leads: acc.leads + c.leads,
      }),
      { spend: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0, leads: 0 }
    );
    return deriveMetricsFromTotals(totals);
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [serverDiagnostics, setServerDiagnostics] = useState<AnalyticsContextType['serverDiagnostics']>(null);

  // Instantiated providers
  const demoProvider = useMemo(() => new DemoAnalyticsProvider(), []);
  const liveProvider = useMemo(() => new GrowthMCPProvider(endpoint), [endpoint]);

  const activeProvider = mode === 'live' ? liveProvider : demoProvider;

  const testConnection = useCallback(async () => {
    const health = await liveProvider.checkHealth();
    setServerDiagnostics({
      toolsCount: health.toolsCount,
      latencyMs: health.latencyMs,
      sessionId: health.sessionId,
      message: health.message,
      tools: health.tools,
    });
    return health;
  }, [liveProvider]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (mode === 'demo') {
      try {
        const demoCamps = await demoProvider.getCampaigns();
        const demoMet = await demoProvider.getOverviewMetrics();
        const accounts = await demoProvider.getAdAccounts();
        setCampaigns(demoCamps);
        setMetrics(demoMet);
        setAdAccounts(accounts);
        setSelectedAccountId(accounts[0]?.id || 'act_2325766324921047');
        setConnectionStatus('connected');
      } catch (err: any) {
        setError(err.message || 'Failed loading demo dataset');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Live mode
    setConnectionStatus('connecting');
    try {
      // 1. Health & handshake
      const health = await liveProvider.checkHealth();
      setServerDiagnostics({
        toolsCount: health.toolsCount,
        latencyMs: health.latencyMs,
        sessionId: health.sessionId,
        message: health.message,
        tools: health.tools,
      });

      if (!health.ok) {
        setConnectionStatus('error');
        setError(health.message || 'Cannot reach GrowthMCP Streamable HTTP server.');
        setIsLoading(false);
        return;
      }

      setConnectionStatus('connected');

      // 2. Discover accounts
      let accounts: AdAccountInfo[] = [];
      try {
        accounts = await liveProvider.getAdAccounts();
        setAdAccounts(accounts);
      } catch (accErr: any) {
        console.warn('Live getAdAccounts warning:', accErr);
      }

      const activeId = accounts.length > 0 ? accounts[0].id : selectedAccountId;
      setSelectedAccountId(activeId);

      // 3. Retrieve campaigns and metrics
      try {
        const liveCamps = await liveProvider.getCampaigns(activeId);
        const liveMet = await liveProvider.getOverviewMetrics(activeId);
        setCampaigns(liveCamps);
        setMetrics(liveMet);
      } catch (campErr: any) {
        console.warn('Could not fetch live campaigns/insights:', campErr);
        // Clean empty state rather than fabricating
        setCampaigns([]);
        setMetrics(
          deriveMetricsFromTotals({
            spend: 0,
            revenue: 0,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            leads: 0,
          })
        );
      }
    } catch (err: any) {
      setConnectionStatus('error');
      setError(err.message || 'Failed to connect to GrowthMCP server');
    } finally {
      setIsLoading(false);
    }
  }, [mode, demoProvider, liveProvider, selectedAccountId]);

  useEffect(() => {
    loadData();
  }, [mode, endpoint]);

  const setMode = useCallback((newMode: DashboardMode) => {
    setModeState(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('growthmcp_mode', newMode);
    }
  }, []);

  const setEndpoint = useCallback((newEndpoint: string) => {
    setEndpointState(newEndpoint);
    liveProvider.setEndpoint(newEndpoint);
    if (typeof window !== 'undefined') {
      localStorage.setItem('growthmcp_endpoint', newEndpoint);
    }
  }, [liveProvider]);

  const selectAccount = useCallback(async (accountId: string) => {
    setSelectedAccountId(accountId);
    if (mode === 'live') {
      setIsLoading(true);
      try {
        const liveCamps = await liveProvider.getCampaigns(accountId);
        const liveMet = await liveProvider.getOverviewMetrics(accountId);
        setCampaigns(liveCamps);
        setMetrics(liveMet);
      } catch (err: any) {
        setError(`Failed fetching campaigns for account ${accountId}: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  }, [mode, liveProvider]);

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return (
    <AnalyticsContext.Provider
      value={{
        mode,
        connectionStatus,
        endpoint,
        provider: activeProvider,
        adAccounts,
        selectedAccountId,
        campaigns,
        metrics,
        isLoading,
        error,
        serverDiagnostics,
        setMode,
        setEndpoint,
        selectAccount,
        refreshData,
        testConnection,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsContextProvider');
  }
  return context;
};
