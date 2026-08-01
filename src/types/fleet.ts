export interface FuelEntry {
  id: string;
  driverName: string;
  truck: string;
  gallons: number;
  cost: number;
  location: string;
  date: string;
}

export interface ELDRecord {
  driverId: string;
  driverName: string;
  status: 'Driving' | 'On Duty' | 'Sleeper' | 'Off Duty';
  driveTimeRemaining: number; 
  dutyTimeRemaining: number;  
  cycleRemaining: number;     
}

export interface User {
  id: number | string;
  name: string;
  email: string;
  role: 'Admin' | 'Dispatcher' | 'Driver' | string;
  status: 'Active' | 'Inactive' | string;
}

export interface FuelStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  dieselPrice: number;
  distanceMiles: number;
}

export interface Invoice {
  id: string;
  carrierName: string;
  loadReference: string;
  loadRate: number;
  feePercentage: number;
  invoiceAmount: number;
  status: 'Unpaid' | 'Paid';
  created_at: string;
}

export interface CustomerClient {
  id: string;
  companyName: string;
  contactName: string;
  mcNumber: string;
  phone: string;
  email: string;
  dispatchFeePercent: number;
  needsMcLease: boolean;
  mcLeaseFeePercent: number;
  status: 'Active' | 'Pending Verification';
  created_at: string;
}