import { supabase } from '../lib/supabase';
import type { ContractorProfile, ProjectWithHomeowner, Quotation } from '../types';

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
  const { error } = await supabase.from('quotations').update({ ...values, status: 'negotiating' }).eq('id', quotationId);
  if (error) throw error;
}

export async function rejectQuotation(quotationId: string) {
  const { error } = await supabase.from('quotations').update({ status: 'rejected' }).eq('id', quotationId);
  if (error) throw error;
}

export type AvailableProjectFilters = {
  city?: string;
  minBudget?: number;
  maxBudget?: number;
  plotSize?: number;
  materialQuality?: string;
  constructionType?: string;
  sort?: 'newest' | 'highest_budget' | 'nearest';
};

export async function listAvailableProjects(contractorId: string, filters: AvailableProjectFilters = {}) {
  let query = supabase
    .from('projects')
    .select('*, homeowner:users!projects_homeowner_id_fkey(*), quotations!left(*)')
    .neq('homeowner_id', contractorId);

  if (filters.city) query = query.eq('city', filters.city);
  if (filters.plotSize) query = query.gte('plot_size', filters.plotSize);
  if (filters.materialQuality) query = query.eq('material_quality', filters.materialQuality);
  if (filters.constructionType) query = query.eq('construction_type', filters.constructionType);

  const { data, error } = await query.order('created_at', { ascending: false }).limit(80);
  if (error) throw error;

  const projects = ((data ?? []) as ProjectWithHomeowner[]).filter((project) => {
    const alreadyRequested = project.quotations?.some((quote) => quote.contractor_id === contractorId);
    const estimate = project.ai_estimate_json?.total_estimate_max ?? project.covered_area * 5000;
    const withinMin = filters.minBudget ? estimate >= filters.minBudget : true;
    const withinMax = filters.maxBudget ? estimate <= filters.maxBudget : true;
    return !alreadyRequested && withinMin && withinMax;
  });

  if (filters.sort === 'highest_budget') {
    return projects.sort((a, b) => (b.ai_estimate_json?.total_estimate_max ?? b.covered_area * 5000) - (a.ai_estimate_json?.total_estimate_max ?? a.covered_area * 5000));
  }

  return projects;
}

export async function createContractorQuotation(project: ProjectWithHomeowner, contractorId: string) {
  const { data, error } = await supabase
    .from('quotations')
    .upsert(
      {
        project_id: project.id,
        homeowner_id: project.homeowner_id,
        contractor_id: contractorId,
        status: 'pending',
        request_notes: 'Contractor initiated from Available Projects.'
      },
      { onConflict: 'project_id,contractor_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data as Quotation;
}
