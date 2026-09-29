import React from 'react';
import { Info } from 'lucide-react';

export const DemoBadge: React.FC = () => {
  return (
    <div className="bg-amber-50/70 border border-amber-200/80 rounded-md p-3 mb-6 flex items-start space-x-2.5 text-xs text-amber-900">
      <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
      <div>
        <span className="font-semibold text-amber-950">DEMO DATASET ACTIVE:</span> This dashboard operates on a deterministic, realistic growth-marketing dataset with multi-channel records (Meta Ads, Google Ads, TikTok Ads). Calculations and investigations execute GrowthMCP algorithms strictly client-side.
      </div>
    </div>
  );
};
