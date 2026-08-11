export interface LoadFinancials {
  rate: number;
  fuelSurcharge?: number;
  accessorials?: number;
  expenses?: number;
}

/**
 * Calculates total revenue for a load including rate, fuel surcharges, and accessorials.
 */
export function calculateTotalRevenue(load: LoadFinancials): number {
  const rate = load.rate || 0;
  const fuelSurcharge = load.fuelSurcharge || 0;
  const accessorials = load.accessorials || 0;
  return rate + fuelSurcharge + accessorials;
}

/**
 * Calculates net profit for a load after subtracting expenses.
 */
export function calculateLoadProfit(load: LoadFinancials): number {
  const totalRevenue = calculateTotalRevenue(load);
  const expenses = load.expenses || 0;
  return totalRevenue - expenses;
}

/**
 * Validates whether a driver has remaining available drive hours (e.g., standard 11-hour rule check).
 */
export function isDriveTimeAvailable(currentDriveMinutes: number, maxAllowedMinutes: number = 660): boolean {
  return currentDriveMinutes < maxAllowedMinutes;
}