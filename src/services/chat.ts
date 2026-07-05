import { supabase } from '../lib/supabase';
import type { ChatMessage } from '../types';

export async function listMessages(projectId: string, peerId: string, userId: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('project_id', projectId)
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ChatMessage[];
}

export async function sendMessage(input: Omit<ChatMessage, 'id' | 'created_at'>) {
  const { error } = await supabase.from('chat_messages').insert(input);
  if (error) throw error;
}
