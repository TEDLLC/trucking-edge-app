import { supabase } from '../lib/supabase';

export async function getLoads() {
  const { data, error } = await (supabase.from('loads') as any)
    .select(`
      *,
      customers (company_name),
      stops (*),
      load_assignments (
        id,
        status,
        drivers (name),
        vehicles (unit_number)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createLoad(loadData: {
  customer_id: string;
  load_number: string;
  rate: number;
  fuel_surcharge: number;
  pickup_date: string;
  delivery_date: string;
  origin_city: string;
  destination_city: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error('User profile or organization not found');

  // 1. Insert the Load record
  const { data: load, error: loadError } = await (supabase.from('loads') as any)
    .insert([
      {
        organization_id: profile.organization_id,
        customer_id: loadData.customer_id,
        load_number: loadData.load_number,
        rate: loadData.rate,
        fuel_surcharge: loadData.fuel_surcharge,
        pickup_date: loadData.pickup_date,
        delivery_date: loadData.delivery_date,
        status: 'booked'
      }
    ])
    .select()
    .single();

  if (loadError) throw loadError;

  // 2. Insert Pickup and Delivery Stops
  const stopsPayload = [
    {
      load_id: load.id,
      stop_type: 'pickup',
      stop_order: 1,
      city: loadData.origin_city,
      scheduled_time: loadData.pickup_date
    },
    {
      load_id: load.id,
      stop_type: 'delivery',
      stop_order: 2,
      city: loadData.destination_city,
      scheduled_time: loadData.delivery_date
    }
  ];

  const { error: stopsError } = await (supabase.from('stops') as any)
    .insert(stopsPayload);

  if (stopsError) throw stopsError;

  return load;
}

export async function updateLoadStatus(loadId: string, status: string) {
  const { data, error } = await (supabase.from('loads') as any)
    .update({ status })
    .eq('id', loadId)
    .select()
    .single();

  if (error) throw error;
  return data;
}