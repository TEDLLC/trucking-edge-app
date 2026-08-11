import { supabase } from '../lib/supabase';
import type { Customer } from '../types/database';

export async function getCustomers() {
  const { data, error } = await (supabase.from('customers') as any)
    .select('*')
    .order('company_name');
  
  if (error) throw error;
  return data as Customer[];
}

export async function addCustomer(customer: { company_name: string; credit_limit?: number }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Fetch the user's organization_id from profiles
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error('User profile or organization not found');

  const { data, error } = await (supabase.from('customers') as any)
    .insert([
      {
        organization_id: profile.organization_id,
        company_name: customer.company_name,
        credit_limit: customer.credit_limit || 0.00
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}