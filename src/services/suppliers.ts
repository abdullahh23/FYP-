import { supabase } from '../lib/supabase';
import type { Promotion, SupplierProduct } from '../types';

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
