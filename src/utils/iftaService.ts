// IFTA Tax Reporting and Metric Calculations

export interface JurisdictionSummary {
  jurisdiction: string;
  totalMiles: number;
  totalGallons: number;
  taxableMiles: number;
}

export function calculateIftaMetrics(
  mileageRecords: { jurisdiction: string; milesDriven: number }[],
  fuelRecords: { jurisdiction: string; gallons: number }[]
): JurisdictionSummary[] {
  const summaryMap: { [key: string]: { totalMiles: number; totalGallons: number } } = {};

  // Aggregate miles by jurisdiction
  mileageRecords.forEach(record => {
    if (!summaryMap[record.jurisdiction]) {
      summaryMap[record.jurisdiction] = { totalMiles: 0, totalGallons: 0 };
    }
    summaryMap[record.jurisdiction].totalMiles += record.milesDriven;
  });

  // Aggregate fuel gallons by jurisdiction
  fuelRecords.forEach(record => {
    if (!summaryMap[record.jurisdiction]) {
      summaryMap[record.jurisdiction] = { totalMiles: 0, totalGallons: 0 };
    }
    summaryMap[record.jurisdiction].totalGallons += record.gallons;
  });

  // Convert map to array format
  return Object.keys(summaryMap).map(jurisdiction => ({
    jurisdiction,
    totalMiles: summaryMap[jurisdiction].totalMiles,
    totalGallons: summaryMap[jurisdiction].totalGallons,
    taxableMiles: summaryMap[jurisdiction].totalMiles // Baseline taxable calculation
  }));
}