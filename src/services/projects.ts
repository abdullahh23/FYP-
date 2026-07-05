import { supabase } from '../lib/supabase';
import { projectTags } from '../lib/utils';
import type { AiEstimate, ContractorMatch, Project, ProjectProgressStage, Promotion, Quotation, RecommendedProduct } from '../types';

export type ProjectFormValues = {
  title: string;
  plot_size: number;
  covered_area: number;
  floors: number;
  basement: boolean;
  city: string;
  soil_type: string;
  construction_type: string;
  material_quality: string;
  interior_finish: string;
  exterior_finish: string;
  parking: boolean;
  solar: boolean;
  smart_home: boolean;
  garden: boolean;
  swimming_pool: boolean;
};

export async function listProjects(homeownerId: string) {
  const { data, error } = await supabase.from('projects').select('*').eq('homeowner_id', homeownerId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function getProject(projectId: string) {
  const { data, error } = await supabase.from('projects').select('*').eq('id', projectId).single();
  if (error) throw error;
  return data as Project;
}

export async function createProject(homeownerId: string, values: ProjectFormValues) {
  const tags = projectTags(values);
  const { data, error } = await supabase
    .from('projects')
    .insert({ ...values, homeowner_id: homeownerId, tags })
    .select()
    .single();
  if (error) throw error;
  return data as Project;
}

export async function requestEstimate(projectId: string) {
  const { data, error } = await supabase.functions.invoke('estimate-cost', { body: { projectId } });
  if (error) throw error;
  if (!data?.estimate) throw new Error(data?.message ?? 'AI estimation is temporarily unavailable.');
  return data.estimate as AiEstimate;
}

export async function saveEstimateFailure(projectId: string, message: string) {
  await supabase.from('projects').update({ ai_error: message }).eq('id', projectId);
}

export async function listContractorMatches(projectId: string) {
  const { data, error } = await supabase.rpc('match_contractors_for_project', { project_id_input: projectId });
  if (error) throw error;
  return (data ?? []) as ContractorMatch[];
}

export async function listRelevantPromotions(projectId: string) {
  const { data, error } = await supabase.rpc('relevant_promotions_for_project', { project_id_input: projectId });
  if (error) throw error;
  return (data ?? []) as Promotion[];
}

export async function requestQuotation(project: Project, contractorId: string, requestNotes = '') {
  const { error } = await supabase.from('quotations').upsert(
    {
      project_id: project.id,
      homeowner_id: project.homeowner_id,
      contractor_id: contractorId,
      status: 'pending',
      request_notes: requestNotes
    },
    { onConflict: 'project_id,contractor_id' }
  );
  if (error) throw error;
}

export async function listRecommendedProducts(projectId: string) {
  const { data, error } = await supabase.rpc('recommended_products_for_project', { project_id_input: projectId });
  if (error) throw error;
  return (data ?? []) as RecommendedProduct[];
}

export async function updateProjectProgress(projectId: string, stage: ProjectProgressStage, notes = '') {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Please sign in.');
  const { error } = await supabase.from('project_progress_updates').insert({ project_id: projectId, stage, notes, updated_by: userData.user.id });
  if (error) throw error;
}

export async function listProjectQuotations(projectId: string) {
  const { data, error } = await supabase
    .from('quotations')
    .select('*, contractor:users!quotations_contractor_id_fkey(*, contractor_profiles(*))')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Quotation[];
}

export async function acceptQuotation(quotation: Quotation) {
  const { error } = await supabase.rpc('accept_project_quotation', { quotation_id_input: quotation.id });
  if (error) throw error;
}

export async function deleteProject(projectId: string) {
  const { error } = await supabase.from('projects').delete().eq('id', projectId);
  if (error) throw error;
}

export async function updateProject(projectId: string, values: Partial<ProjectFormValues>) {
  const { data, error } = await supabase
    .from('projects')
    .update(values)
    .eq('id', projectId)
    .select()
    .single();
  if (error) throw error;
  return data as Project;
}

export async function archiveProject(projectId: string, isArchived = true) {
  const { error } = await supabase.from('projects').update({ is_archived: isArchived }).eq('id', projectId);
  if (error) throw error;
}

export async function duplicateProject(projectId: string) {
  const project = await getProject(projectId);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, created_at, updated_at, ai_estimate_json, ai_error, ai_estimated_at, accepted_quotation_id, ...rest } = project;
  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...rest,
      title: `${project.title} (Copy)`,
      status: 'Planning',
      is_archived: false
    })
    .select()
    .single();
  if (error) throw error;
  try {
    await requestEstimate(data.id);
  } catch (e) {
    console.error("AI estimation error during duplication:", e);
  }
  return data as Project;
}
