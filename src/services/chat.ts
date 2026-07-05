import { supabase } from '../lib/supabase';
import type { ChatMessage, Conversation, ConversationThread, UserRole } from '../types';

export async function getConversation(projectId: string, peerId: string, userId: string, quotationId?: string | null) {
  const { data: participants, error: participantsError } = await supabase.from('users').select('id, role').in('id', [peerId, userId]);
  if (participantsError) throw participantsError;
  const roles = new Map((participants ?? []).map((participant) => [participant.id, participant.role as UserRole]));
  const homeownerId = roles.get(userId) === 'homeowner' ? userId : roles.get(peerId) === 'homeowner' ? peerId : null;
  const contractorId = roles.get(userId) === 'contractor' ? userId : roles.get(peerId) === 'contractor' ? peerId : null;
  const supplierId = roles.get(userId) === 'supplier' ? userId : roles.get(peerId) === 'supplier' ? peerId : null;
  if (!homeownerId || (!contractorId && !supplierId)) throw new Error('A valid homeowner and contractor or supplier are required to start chat.');

  let query = supabase.from('conversations').select('*').eq('project_id', projectId);
  if (homeownerId) query = query.eq('homeowner_id', homeownerId);
  if (contractorId) query = query.eq('contractor_id', contractorId);
  if (supplierId) query = query.eq('supplier_id', supplierId);

  const { data: existing, error } = await query.maybeSingle();
  if (error) throw error;
  if (existing) return existing as Conversation;

  const payload = {
    project_id: projectId,
    quotation_id: quotationId ?? null,
    homeowner_id: homeownerId,
    contractor_id: contractorId,
    supplier_id: supplierId
  };
  const { data, error: insertError } = await supabase.from('conversations').insert(payload).select().single();
  if (insertError) throw insertError;
  return data as Conversation;
}

export async function listConversationsForUser(userId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*, projects(*), homeowner:users!conversations_homeowner_id_fkey(*), contractor:users!conversations_contractor_id_fkey(*), supplier:users!conversations_supplier_id_fkey(*)')
    .or(`homeowner_id.eq.${userId},contractor_id.eq.${userId},supplier_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ConversationThread[];
}

export async function listMessages(conversationId: string) {
  const { data, error } = await supabase.from('chat_messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ChatMessage[];
}

export async function sendMessage(input: Omit<ChatMessage, 'id' | 'created_at' | 'seen_at'>) {
  const { error } = await supabase.from('chat_messages').insert(input);
  if (error) throw error;
}

export async function markConversationSeen(conversationId: string, userId: string) {
  const { error } = await supabase.from('chat_messages').update({ seen_at: new Date().toISOString() }).eq('conversation_id', conversationId).eq('receiver_id', userId).is('seen_at', null);
  if (error) throw error;
}

export async function setTyping(conversationId: string, userId: string, isTyping: boolean) {
  const { error } = await supabase.from('typing_presence').upsert({ conversation_id: conversationId, user_id: userId, is_typing: isTyping, updated_at: new Date().toISOString() });
  if (error) throw error;
}
