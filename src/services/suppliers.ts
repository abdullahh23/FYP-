import { supabase } from '../lib/supabase';
import type { MaterialQuoteRequest, Promotion, SupplierProduct, SupplierProfile } from '../types';

export async function getSupplierProfile(userId: string) {
  const { data, error } = await supabase.from('supplier_profiles').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data as SupplierProfile | null;
}

export async function upsertSupplierProfile(userId: string, values: Partial<SupplierProfile>) {
  const { error } = await supabase.from('supplier_profiles').upsert({ ...values, user_id: userId });
  if (error) throw error;
}

export async function listProducts(supplierId: string) {
  const { data, error } = await supabase.from('products').select('*').eq('supplier_id', supplierId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SupplierProduct[];
}

export async function createProduct(input: Omit<SupplierProduct, 'id' | 'created_at'>) {
  const { error } = await supabase.from('products').insert(input);
  if (error) throw error;
}

export async function listPromotions(supplierId: string) {
  const { data, error } = await supabase
    .from('supplier_promotions')
    .select('*, products(*)')
    .eq('supplier_id', supplierId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Promotion[];
}

export async function createPromotion(input: Omit<Promotion, 'id' | 'products'>) {
  const { error } = await supabase.from('supplier_promotions').insert(input);
  if (error) throw error;
}

export async function getProduct(productId: string) {
  const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
  if (error) throw error;
  const { data: supplier, error: supplierError } = await supabase.from('supplier_profiles').select('*').eq('user_id', data.supplier_id).maybeSingle();
  if (supplierError) throw supplierError;
  return { ...data, supplier_profile: supplier } as SupplierProduct;
}

export async function listProductReviews(productId: string) {
  const { data, error } = await supabase.from('product_reviews').select('*, homeowner:users(name, profile_image_url)').eq('product_id', productId).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listRelatedProducts(productId: string, category: string) {
  const { data, error } = await supabase.from('products').select('*').eq('category', category).eq('is_active', true).neq('id', productId).limit(4);
  if (error) throw error;
  return (data ?? []) as SupplierProduct[];
}

export async function requestMaterialQuote(input: { projectId: string; homeownerId: string; supplierId: string; products: Array<{ productId: string; quantity: number }> }) {
  const { data, error } = await supabase.from('material_quote_requests').insert({ project_id: input.projectId, homeowner_id: input.homeownerId, supplier_id: input.supplierId }).select().single();
  if (error) throw error;
  const { error: itemError } = await supabase.from('material_quote_items').insert(input.products.map((item) => ({ request_id: data.id, product_id: item.productId, quantity: item.quantity })));
  if (itemError) throw itemError;
  return data as MaterialQuoteRequest;
}

export async function listMaterialQuoteRequests(userId: string, role: 'homeowner' | 'supplier') {
  const column = role === 'supplier' ? 'supplier_id' : 'homeowner_id';
  const { data, error } = await supabase.from('material_quote_requests').select('*, items:material_quote_items(*, products(*))').eq(column, userId).order('created_at', { ascending: false });
  if (error) throw error;
  const supplierIds = [...new Set((data ?? []).map((request) => request.supplier_id))];
  const { data: suppliers, error: supplierError } = supplierIds.length ? await supabase.from('supplier_profiles').select('*').in('user_id', supplierIds) : { data: [], error: null };
  if (supplierError) throw supplierError;
  return (data ?? []).map((request) => ({ ...request, supplier: suppliers?.find((supplier) => supplier.user_id === request.supplier_id) })) as MaterialQuoteRequest[];
}

export async function acceptMaterialQuote(requestId: string) {
  const { error } = await supabase.from('material_quote_requests').update({ status: 'accepted' }).eq('id', requestId);
  if (error) throw error;
}

export async function respondToMaterialQuote(requestId: string, values: { total_price: number; delivery_time: string; discount: number; notes: string }) {
  const { error } = await supabase.from('material_quote_requests').update({ ...values, status: 'negotiating' }).eq('id', requestId);
  if (error) throw error;
}
