export type UserRole = 'admin' | 'dispatch' | 'driver' | 'billing' | 'viewer';
export type VehicleType = 'truck' | 'trailer';
export type VehicleStatus = 'active' | 'maintenance' | 'inactive';
export type DriverStatus = 'available' | 'disposed' | 'on_duty' | 'off_duty';
export type LoadStatus = 'booked' | 'dispatched' | 'in_transit' | 'delivered' | 'cancelled';
export type StopType = 'pickup' | 'delivery';
export type StopStatus = 'pending' | 'arrived' | 'completed';
export type DocumentType = 'bol' | 'pod' | 'scale_ticket' | 'lumper_receipt' | 'other';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface Organization {
  id: string;
  name: string;
  dot_number?: string;
  mc_number?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  full_name?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  organization_id: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  billing_address?: string;
  credit_limit: number;
  created_at: string;
}

export interface Vehicle {
  id: string;
  organization_id: string;
  unit_number: string;
  type: VehicleType;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  status: VehicleStatus;
  created_at: string;
}

export interface Driver {
  id: string;
  organization_id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  license_number: string;
  license_state: string;
  license_expiration?: string;
  status: DriverStatus;
  created_at: string;
}

export interface Load {
  id: string;
  organization_id: string;
  load_number: string;
  customer_id: string;
  status: LoadStatus;
  rate: number;
  commodity?: string;
  weight_lbs?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Stop {
  id: string;
  load_id: string;
  stop_sequence: number;
  stop_type: StopType;
  facility_name: string;
  address: string;
  scheduled_time: string;
  actual_time?: string;
  status: StopStatus;
}

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Organization, 'id'>>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      customers: {
        Row: Customer;
        Insert: Omit<Customer, 'id' | 'created_at'>;
        Update: Partial<Omit<Customer, 'id'>>;
      };
      vehicles: {
        Row: Vehicle;
        Insert: Omit<Vehicle, 'id' | 'created_at'>;
        Update: Partial<Omit<Vehicle, 'id'>>;
      };
      drivers: {
        Row: Driver;
        Insert: Omit<Driver, 'id' | 'created_at'>;
        Update: Partial<Omit<Driver, 'id'>>;
      };
      loads: {
        Row: Load;
        Insert: Omit<Load, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Load, 'id'>>;
      };
      stops: {
        Row: Stop;
        Insert: Omit<Stop, 'id'>;
        Update: Partial<Omit<Stop, 'id'>>;
      };
    };
  };
}