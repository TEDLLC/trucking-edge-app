import React from 'react';
import { useRegionStore } from '../services/useRegion';
import { useEuHosStore } from '../services/useEuHosStore';
import { EU_RULES, checkEuBreakCompliance } from '../services/euRules';
import { MultiManningPanel } from './MultiManningPanel';
import { EuWeeklyStats } from './EuWeeklyStats';
import { EuViolationAlert } from './EuViolationAlert';
import { EuBorderCrossingLog } from './EuBorderCrossingLog';
import { EuPostingWorkersView } from './EuPostingWorkersView';
import { EuInfractionAudit } from './EuInfractionAudit';
import { EuCsrdEmissions } from './EuCsrdEmissions';
import { EuDddExport } from './EuDddExport';

export const EuHosView: React.FC = () => {
  const { region } = useRegionStore();
  
  // Pulling state and actions from our centralized Zustand store
  const { 
    continuousDrivingMinutes, 
    dailyDrivingMinutes, 
    weeklyDrivingHours,
    twoWeekTotalHours,
    addDrivingMinutes, 
    resetBreak 
  } = useEuHosStore();

  const breakStatus = checkEuBreakCompliance(continuousDrivingMinutes);

  if (region !== 'EU') {
    return null; // Only render when EU mode is active
  }

  return (
    <div className="space-y-6">
      {/* Real-time Violation & Warning Alert Banner */}
      <EuViolationAlert />

      {/* EU Compliance Banner */}
      <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">EU Regulation 561/2006 & Enterprise Suite Active</h3>
          <p className="text-xs text-slate-400">Monitoring tachograph, continuous driving limits, cross-border labor laws, and ESG reporting.</p>
        </div>
        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow">
          🇪🇺 Enterprise Standard
        </span>
      </div>

      {/* Break & Driving Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Continuous Driving & Break Timer */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-slate-400">Continuous Driving / Break Status</span>
            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${breakStatus.compliant ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
              {breakStatus.compliant ? 'Compliant' : 'Warning'}
            </span>
          </div>
          
          <div className="text-2xl font-bold text-white">
            {(continuousDrivingMinutes / 60).toFixed(1)} hrs <span className="text-xs font-normal text-slate-400">/ 4.5 hrs max</span>
          </div>
          
          <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
            {breakStatus.message}
          </p>

          <div className="flex gap-2 pt-2">
            <button 
              onClick={() => addDrivingMinutes(-30)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded font-medium transition"
            >
              - 30m Drive
            </button>
            <button 
              onClick={() => addDrivingMinutes(30)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-xs text-white rounded font-medium transition"
            >
              + 30m Drive
            </button>
            <button 
              onClick={resetBreak}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-xs text-white rounded font-medium transition ml-auto"
            >
              Take 45m Break
            </button>
          </div>
        </div>

        {/* Daily Driving Limit Counter */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-slate-400">Daily Driving Limit (9h / 10h max)</span>
            <span className="text-xs text-slate-400">Max: {EU_RULES.MAX_DAILY_DRIVING_MINUTES / 60} hrs</span>
          </div>

          <div className="text-2xl font-bold text-white">
            {(dailyDrivingMinutes / 60).toFixed(1)} hrs <span className="text-xs font-normal text-slate-400">completed</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (dailyDrivingMinutes / EU_RULES.MAX_DAILY_DRIVING_MINUTES) * 100)}%` }}
            />
          </div>

          <p className="text-xs text-slate-400">
            Requires an 11-hour regular daily rest period (or reduced 9-hour rest up to 3 times weekly).
          </p>
        </div>
      </div>

      {/* Advanced Enterprise Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EuBorderCrossingLog />
        <EuDddExport />
      </div>

      <EuPostingWorkersView />
      <EuInfractionAudit />
      <EuCsrdEmissions />

      {/* Secondary Compliance Panels */}
      <MultiManningPanel />
      <EuWeeklyStats 
        currentWeekHours={weeklyDrivingHours} 
        twoWeekTotalHours={twoWeekTotalHours} 
      />
    </div>
  );
};