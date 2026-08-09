import React, { useState } from 'react';

export function EuHosCalculator() {
  const [continuousDriving, setContinuousDriving] = useState(3.5); // Max 4.5h before break
  const [dailyDriving, setDailyDriving] = useState(7.0); // Max 9h (or 10h)
  const [weeklyDriving, setWeeklyDriving] = useState(38.0); // Max 56h

  const continuousLimit = 4.5;
  const dailyLimit = 9.0;
  const weeklyLimit = 56.0;

  const isBreakNeeded = continuousDriving >= continuousLimit;
  const isDailyWarning = dailyDriving >= dailyLimit;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">EU 561/2006 Real-Time HOS Engine</h3>
          <p className="text-xs text-slate-400">Live monitoring of driving blocks, rest requirements, and statutory limits.</p>
        </div>
        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-full">
          Regulation Compliant
        </span>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Continuous Driving / Break Card */}
        <div className={`p-4 rounded-lg border ${isBreakNeeded ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-950/60 border-slate-800'}`}>
          <div className="text-xs text-slate-400 font-medium mb-1">Continuous Driving (Max 4.5h)</div>
          <div className="text-2xl font-bold text-white mb-2">{continuousDriving} hrs</div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${isBreakNeeded ? 'bg-rose-500' : 'bg-indigo-500'}`} 
              style={{ width: `${Math.min((continuousDriving / continuousLimit) * 100, 100)}%` }}
            ></div>
          </div>
          <p className={`text-[11px] mt-2 font-medium ${isBreakNeeded ? 'text-rose-400' : 'text-slate-400'}`}>
            {isBreakNeeded ? '⚠️ Mandatory 45-min break required immediately!' : `Break required in ${(continuousLimit - continuousDriving).toFixed(1)} hrs`}
          </p>
        </div>

        {/* Daily Driving Limit */}
        <div className={`p-4 rounded-lg border ${isDailyWarning ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-950/60 border-slate-800'}`}>
          <div className="text-xs text-slate-400 font-medium mb-1">Daily Driving Limit (Max 9h/10h)</div>
          <div className="text-2xl font-bold text-white mb-2">{dailyDriving} hrs</div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${Math.min((dailyDriving / dailyLimit) * 100, 100)}%` }}></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {dailyDriving >= 9 ? '⚠️ Approaching/Exceeded standard 9h limit' : `${(dailyLimit - dailyDriving).toFixed(1)} hrs remaining today`}
          </p>
        </div>

        {/* Weekly Driving Limit */}
        <div className="p-4 rounded-lg border bg-slate-950/60 border-slate-800">
          <div className="text-xs text-slate-400 font-medium mb-1">Weekly Driving Limit (Max 56h)</div>
          <div className="text-2xl font-bold text-white mb-2">{weeklyDriving} hrs</div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${Math.min((weeklyDriving / weeklyLimit) * 100, 100)}%` }}></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {(weeklyLimit - weeklyDriving).toFixed(1)} hrs remaining this week
          </p>
        </div>
      </div>
    </div>
  );
}