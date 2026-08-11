export const LOAD_STATUSES = {
  PENDING: 'Pending',
  DISPATCHED: 'Dispatched',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
} as const;

export const VEHICLE_STATUSES = {
  ACTIVE: 'Active',
  MAINTENANCE: 'Maintenance',
  INACTIVE: 'Inactive',
} as const;

export const DRIVER_STATUSES = {
  AVAILABLE: 'Available',
  ON_DUTY: 'On Duty',
  OFF_DUTY: 'Off Duty',
  SLEEPER: 'Sleeper',
} as const;

export type LoadStatus = typeof LOAD_STATUSES[keyof typeof LOAD_STATUSES];
export type VehicleStatus = typeof VEHICLE_STATUSES[keyof typeof VEHICLE_STATUSES];
export type DriverStatus = typeof DRIVER_STATUSES[keyof typeof DRIVER_STATUSES];