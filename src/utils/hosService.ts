// Hours of Service (HOS) Compliance & Violation Detection

export interface HosStatusPayload {
  driverId: string;
  status: 'DRIVING' | 'ON_DUTY' | 'OFF_DUTY' | 'SLEEPER';
  hoursDrivenToday: number;
  cycleHoursUsed: number;
}

export function evaluateHosCompliance(payload: HosStatusPayload): { violation: boolean; reason?: string } {
  // FMCSA Rule checks: Max 11 driving hours per day, max 70 hours in 8 days cycle
  if (payload.hoursDrivenToday > 11) {
    return { 
      violation: true, 
      reason: `Exceeded maximum daily driving limit of 11 hours (${payload.hoursDrivenToday} hrs logged).` 
    };
  }

  if (payload.cycleHoursUsed > 70) {
    return { 
      violation: true, 
      reason: `Exceeded 70-hour / 8-day cycle limit (${payload.cycleHoursUsed} hrs used).` 
    };
  }

  return { violation: false };
}