import { supabase } from '../lib/supabase';
import type { ContractorProfile, Quotation } from '../types';

export async function getContractorProfile(userId: string) {
  const { data, error } = await supabase.from('contractor_profiles').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data as ContractorProfile | null;
}

export async function upsertContractorProfile(userId: string, values: Partial<ContractorProfile>) {
  const { error } = await supabase.from('contractor_profiles').upsert({ ...values, user_id: userId });
  if (error) throw error;
}

export async function listIncomingRequests(contractorId: string) {
  const { data, error } = await supabase
    .from('quotations')
    .select('*, projects(*), homeowner:users!quotations_homeowner_id_fkey(*)')
    .eq('contractor_id', contractorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as (Quotation & { projects: unknown; homeowner: unknown })[];
}

export async function submitQuotation(quotationId: string, values: { amount: number; duration_days: number; notes: string; timeline: string }) {
  const { error } = await supabase.from('quotations').update({ ...values, status: 'submitted' }).eq('id', quotationId);
  if (error) throw error;
}
