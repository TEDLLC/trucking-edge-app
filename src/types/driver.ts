export interface Driver {
  id: string;
  name: string;
  phone: string;
  truck: string;
  payPerMile: number;
  status: 'Available' | 'On Route' | 'Off Duty';
  drivingHoursLeft?: number;
  shiftHoursLeft?: number;
  cycleHoursLeft?: number;
}