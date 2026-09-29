import React, { useState, useEffect } from 'react';
import type { NavigationTab } from './types/analytics';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { OverviewView } from './components/views/OverviewView';
import { CampaignsView } from './components/views/CampaignsView';
import { AcquisitionView } from './components/views/AcquisitionView';
import { CreativesView } from './components/views/CreativesView';
import { CohortsView } from './components/views/CohortsView';
import { RevenueView } from './components/views/RevenueView';
import { InvestigationsView } from './components/views/InvestigationsView';
import { AIAnalystView } from './components/views/AIAnalystView';
import { DataSourcesView } from './components/views/DataSourcesView';
import { SystemView } from './components/views/SystemView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [dateRange, setDateRange] = useState('Last 7 Days (Sep 14 – Sep 20)');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [investigationQuestion, setInvestigationQuestion] = useState<string | undefined>(undefined);

  // Sync hash with active tab for GitHub Pages routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as NavigationTab;
      const validTabs: NavigationTab[] = [
        'overview', 'campaigns', 'acquisition', 'creatives',
        'cohorts', 'revenue', 'investigations', 'analyst',
        'datasources', 'system'
      ];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleInvestigateCampaign = (campaignName: string) => {
    setInvestigationQuestion(`Why did ROAS change for ${campaignName}?`);
    handleSelectTab('investigations');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* Persistent Left Sidebar */}
      <Sidebar activeTab={activeTab} onSelectTab={handleSelectTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <TopBar
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && <OverviewView />}
            {activeTab === 'campaigns' && (
              <CampaignsView onInvestigateCampaign={handleInvestigateCampaign} />
            )}
            {activeTab === 'acquisition' && <AcquisitionView />}
            {activeTab === 'creatives' && <CreativesView />}
            {activeTab === 'cohorts' && <CohortsView />}
            {activeTab === 'revenue' && <RevenueView />}
            {activeTab === 'investigations' && (
              <InvestigationsView initialQuestion={investigationQuestion} />
            )}
            {activeTab === 'analyst' && <AIAnalystView />}
            {activeTab === 'datasources' && <DataSourcesView />}
            {activeTab === 'system' && <SystemView />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
