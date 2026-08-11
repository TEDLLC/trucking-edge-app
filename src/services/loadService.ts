import { supabase } from '../supabase'; // Or adjust to your actual filename, e.g., '../supabaseClient'
import { handleSupabaseError } from '../utils/errorHandler';
import type { Database } from '../types/supabase';

type PublicTables = Database extends { public: { Tables: infer T } } ? T : Record<string, any>;
export type LoadRow = PublicTables extends { loads: { Row: infer R } } ? R : any;
export type LoadInsert = PublicTables extends { loads: { Insert: infer I } } ? I : any;

export async function fetchLoads(organizationId: string): Promise<LoadRow[]> {
  try {
    const { data, error } = await (supabase as any)
      .from('loads')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) throw error;
    return data || [];
  } catch (err) {
    const message = handleSupabaseError(err, 'Failed to fetch loads');
    throw new Error(message);
  }
}

export async function createLoad(newLoad: LoadInsert): Promise<LoadRow | null> {
  try {
    const { data, error } = await (supabase as any)
      .from('loads')
      .insert([newLoad])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    const message = handleSupabaseError(err, 'Failed to create load');
    throw new Error(message);
  }
}

export async function dispatchLoadRpc(loadId: string, driverId: string, vehicleId: string): Promise<void> {
  try {
    const { error } = await (supabase as any).rpc('dispatch_load', {
      p_load_id: loadId,
      p_driver_id: driverId,
      p_vehicle_id: vehicleId,
    });

    if (error) throw error;
  } catch (err) {
    const message = handleSupabaseError(err, 'Failed to dispatch load via atomic transaction');
    throw new Error(message);
  }
}