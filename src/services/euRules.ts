// EU Regulation (EC) No 561/2006 Rules & Limits

export interface EuLogEntry {
  status: 'driving' | 'other_work' | 'availability' | 'break_rest';
  durationMinutes: number;
  timestamp: string;
}

export const EU_RULES = {
  MAX_CONTINUOUS_DRIVING_MINUTES: 270, // 4.5 hours
  MANDATORY_BREAK_TOTAL_MINUTES: 45, // Total break required after 4.5h driving
  MAX_DAILY_DRIVING_MINUTES: 540,      // 9 hours standard (can be 10h twice a week)
  MAX_WEEKLY_DRIVING_MINUTES: 3360,    // 56 hours
  MAX_FORTNIGHTLY_DRIVING_MINUTES: 5400, // 90 hours across 2 weeks
  MIN_DAILY_REST_MINUTES: 660,         // 11 hours standard rest (can be reduced to 9h)
};

// Helper function to check if an EU driver needs a break
export function checkEuBreakCompliance(continuousDrivingMinutes: number): {
  compliant: boolean;
  message: string;
} {
  if (continuousDrivingMinutes > EU_RULES.MAX_CONTINUOUS_DRIVING_MINUTES) {
    return {
      compliant: false,
      message: 'VIOLATION: Exceeded 4.5 hours of continuous driving without a 45-min break!',
    };
  }
  if (continuousDrivingMinutes >= 240) {
    return {
      compliant: true,
      message: 'WARNING: Approaching 4.5-hour driving limit. Prepare for a break.',
    };
  }
  return {
    compliant: true,
    message: 'Driving time within EU limits.',
  };
}