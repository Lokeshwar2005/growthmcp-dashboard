import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DemoAnalyticsProvider, GrowthMCPProvider } from '../services/analyticsProvider';

describe('DemoAnalyticsProvider', () => {
  const provider = new DemoAnalyticsProvider();

  it('reports mode as demo', () => {
    expect(provider.mode).toBe('demo');
  });

  it('returns valid demo ad accounts', async () => {
    const accounts = await provider.getAdAccounts();
    expect(accounts.length).toBeGreaterThan(0);
    expect(accounts[0].id).toBe('act_2325766324921047');
    expect(accounts[0].currency).toBe('USD');
  });

  it('returns non-empty campaign list', async () => {
    const campaigns = await provider.getCampaigns();
    expect(campaigns.length).toBe(7);
    expect(campaigns[0].platform).toBe('Meta');
    expect(campaigns[0].spend).toBeGreaterThan(0);
  });

  it('calculates deterministic overview metrics', async () => {
    const metrics = await provider.getOverviewMetrics();
    expect(metrics.spend).toBe(23470.5);
    expect(metrics.revenue).toBe(48596.88);
    expect(metrics.roas).toBeCloseTo(2.07, 1);
    expect(metrics.leads).toBe(3288);
  });

  it('runs deterministic investigation', async () => {
    const result = await provider.runInvestigation('Why did ROAS drop?');
    expect(result.target_metric).toBe('roas');
    expect(result.drivers.length).toBeGreaterThan(0);
    expect(result.breakdowns.campaign.length).toBeGreaterThan(0);
  });

  it('runs deterministic natural language analyst query', async () => {
    const result = await provider.runAnalystQuery('What was our total ROAS?');
    expect(result.requested_metrics).toContain('roas');
    expect(result.metrics.roas).toBeGreaterThan(0);
    expect(result.record_count).toBeGreaterThan(0);
  });

  it('reports health as ready', async () => {
    const health = await provider.checkHealth();
    expect(health.ok).toBe(true);
    expect(health.toolsCount).toBe(12);
  });
});

describe('GrowthMCPProvider', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes endpoint URLs properly', () => {
    const p1 = new GrowthMCPProvider('http://127.0.0.1:8080');
    expect(p1.getEndpoint()).toBe('http://127.0.0.1:8080/mcp');

    const p2 = new GrowthMCPProvider('http://localhost:8080/mcp/');
    expect(p2.getEndpoint()).toBe('http://localhost:8080/mcp');
  });

  it('parses SSE formatted JSON-RPC messages', async () => {
    const provider = new GrowthMCPProvider('http://127.0.0.1:8080/mcp');

    const mockResponseText = `event: message
data: {"jsonrpc":"2.0","id":1,"result":{"tools":[{"name":"calculate_growth_metrics"}]}}
`;

    // Mock fetch for initialize and tools/list
    globalThis.fetch = vi.fn().mockImplementation((_url, opts) => {
      const body = JSON.parse(opts?.body as string || '{}');
      if (body.method === 'initialize') {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'mcp-session-id': 'sess-12345' }),
          text: () => Promise.resolve('event: message\ndata: {"jsonrpc":"2.0","id":1,"result":{"serverInfo":{"name":"test"}}}\n'),
        } as Response);
      }
      if (body.method === 'notifications/initialized') {
        return Promise.resolve({ ok: true, status: 202, headers: new Headers() } as Response);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ 'mcp-session-id': 'sess-12345' }),
        text: () => Promise.resolve(mockResponseText),
      } as Response);
    });

    const health = await provider.checkHealth();
    expect(health.ok).toBe(true);
    expect(health.toolsCount).toBe(1);
    expect(health.sessionId).toBe('sess-12345');
  });

  it('handles connection network errors gracefully', async () => {
    const provider = new GrowthMCPProvider('http://127.0.0.1:9999/mcp');

    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

    const health = await provider.checkHealth();
    expect(health.ok).toBe(false);
    expect(health.message).toContain('Connection refused');
  });

  it('handles empty campaigns from ad account truthfully without fabrication', async () => {
    const provider = new GrowthMCPProvider('http://127.0.0.1:8080/mcp');

    globalThis.fetch = vi.fn().mockImplementation((_url, opts) => {
      const body = JSON.parse(opts?.body as string || '{}');
      if (body.method === 'initialize') {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'mcp-session-id': 'sess-123' }),
          text: () => Promise.resolve('event: message\ndata: {"jsonrpc":"2.0","result":{}}\n'),
        } as Response);
      }
      if (body.method === 'tools/call' && body.params?.name === 'get_campaigns') {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers(),
          text: () => Promise.resolve('event: message\ndata: {"jsonrpc":"2.0","result":{"structuredContent":[]}}\n'),
        } as Response);
      }
      return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('{}'), headers: new Headers() } as Response);
    });

    const campaigns = await provider.getCampaigns('act_empty123');
    expect(campaigns).toEqual([]);

    const metrics = await provider.getOverviewMetrics('act_empty123');
    expect(metrics.spend).toBe(0);
    expect(metrics.revenue).toBe(0);
    expect(metrics.roas).toBe(0);
  });
});
