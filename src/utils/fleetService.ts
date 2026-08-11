import { supabase } from '../lib/supabase';

// --- DRIVERS ---
export async function getDrivers() {
  const { data, error } = await (supabase.from('drivers') as any)
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createDriver(driverData: {
  name: string;
  license_number: string;
  phone: string;
  email: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error('Organization not found');

  const { data, error } = await (supabase.from('drivers') as any)
    .insert([
      {
        organization_id: profile.organization_id,
        name: driverData.name,
        license_number: driverData.license_number,
        phone: driverData.phone,
        email: driverData.email,
        status: 'active'
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- VEHICLES (TRUCKS & TRAILERS) ---
export async function getVehicles() {
  const { data, error } = await (supabase.from('vehicles') as any)
    .select('*')
    .order('unit_number', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createVehicle(vehicleData: {
  unit_number: string;
  make: string;
  model: string;
  year: number;
  plate_number: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error('Organization not found');

  const { data, error } = await (supabase.from('vehicles') as any)
    .insert([
      {
        organization_id: profile.organization_id,
        unit_number: vehicleData.unit_number,
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year,
        plate_number: vehicleData.plate_number,
        status: 'active'
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}