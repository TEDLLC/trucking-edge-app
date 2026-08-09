import React from 'react';

interface WeeklyStatProps {
  currentWeekHours: number;
  twoWeekTotalHours: number;
}

export const EuWeeklyStats: React.FC<WeeklyStatProps> = ({ currentWeekHours, twoWeekTotalHours }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mt-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-bold text-white">Weekly Driving Limits</h3>
          <p className="text-xs text-slate-400">EU Reg 561/2006 Limits</p>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Rolling Totals</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Current Week */}
        <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
          <p className="text-xs text-slate-400 mb-1">Current Week</p>
          <div className="text-xl font-bold text-white">{currentWeekHours}h</div>
          <p className="text-[10px] text-emerald-400">Limit: 56 hours</p>
        </div>

        {/* Two-Week Total */}
        <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
          <p className="text-xs text-slate-400 mb-1">2-Week Total</p>
          <div className="text-xl font-bold text-white">{twoWeekTotalHours}h</div>
          <p className="text-[10px] text-amber-400">Limit: 90 hours</p>
        </div>
      </div>
      
      <div className="bg-rose-900/10 border border-rose-500/20 p-3 rounded-lg flex items-center gap-3">
        <div className="text-rose-400 text-lg">⚠️</div>
        <p className="text-[11px] text-rose-200">
          Ensure 45-hour regular weekly rest is taken after no more than 6 consecutive 24-hour periods.
        </p>
      </div>
    </div>
  );
};