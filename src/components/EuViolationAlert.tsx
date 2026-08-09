import React from 'react';
import { useEuHosStore } from '../services/useEuHosStore';

export const EuViolationAlert: React.FC = () => {
  const { continuousDrivingMinutes, dailyDrivingMinutes } = useEuHosStore();

  const isContinuousWarning = continuousDrivingMinutes >= 240; // 4 hours (warning threshold)
  const isContinuousViolation = continuousDrivingMinutes > 270; // 4.5 hours max
  const isDailyViolation = dailyDrivingMinutes > 600; // 10 hours max

  if (!isContinuousWarning && !isDailyViolation) {
    return null; // Return nothing if everything is fully compliant
  }

  return (
    <div className={`p-4 rounded-xl border flex items-center justify-between shadow-lg transition-all ${
      isContinuousViolation || isDailyViolation
        ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
        : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
    }`}>
      <div className="flex items-center gap-3">
        <span className="text-xl">
          {isContinuousViolation || isDailyViolation ? '🚨' : '⚠️'}
        </span>
        <div>
          <h4 className="text-sm font-bold">
            {isContinuousViolation ? 'Regulation 561/2006 Infringement: Continuous Limit Exceeded' : 'Compliance Warning: Approaching Break Limit'}
          </h4>
          <p className="text-xs opacity-90 mt-0.5">
            {isContinuousViolation 
              ? `Driver has logged ${(continuousDrivingMinutes / 60).toFixed(1)}h of continuous driving without a 45-minute break. Immediate rest required.`
              : `Driver is at ${(continuousDrivingMinutes / 60).toFixed(1)}h continuous driving. Mandatory 45-minute break must be taken before reaching 4.5 hours.`
            }
          </p>
        </div>
      </div>
      <span className="text-xs font-semibold px-2.5 py-1 rounded bg-black/30 border border-current">
        {isContinuousViolation ? 'VIOLATION' : 'WARNING'}
      </span>
    </div>
  );
};