import { supabase } from '../lib/supabase';

export async function getEldLogs() {
  const { data, error } = await (supabase.from('eld_logs') as any)
    .select(`
      *,
      drivers (
        name,
        license_number
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createEldLog(logData: {
  driver_id: string;
  status: string;
  location?: string;
  notes?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error('Organization not found');

  const { data, error } = await (supabase.from('eld_logs') as any)
    .insert([
      {
        organization_id: profile.organization_id,
        driver_id: logData.driver_id,
        status: logData.status,
        location: logData.location || 'Depot',
        notes: logData.notes || '',
        log_date: new Date().toISOString().split('T')[0]
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}