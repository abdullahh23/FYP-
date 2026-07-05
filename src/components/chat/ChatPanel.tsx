import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCheck, FileText, ImagePlus, Paperclip, Send, SmilePlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { getConversation, listMessages, markConversationSeen, sendMessage, setTyping } from '../../services/chat';
import { createSignedFileUrl, uploadPrivateFile, uploadToBucket } from '../../services/storage';
import { Button } from '../ui/button';
import { Input } from '../ui/forms';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../ui/toast';
import { cn } from '../../lib/utils';

export function ChatPanel({ projectId, peerId, quotationId, peerName }: { projectId: string; peerId: string; quotationId?: string | null; peerName: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<number>();
  const conversation = useQuery({
    queryKey: ['conversation', projectId, peerId],
    queryFn: () => getConversation(projectId, peerId, user!.id, quotationId),
    enabled: Boolean(user?.id && projectId && peerId)
  });
  const conversationId = conversation.data?.id;
  const key = ['messages', conversationId];
  const messages = useQuery({ queryKey: key, queryFn: () => listMessages(conversationId!), enabled: Boolean(conversationId) });

  useEffect(() => {
    if (!conversationId || !user?.id) return;
    markConversationSeen(conversationId, user.id).then(() => queryClient.invalidateQueries({ queryKey: key }));
    const channel = supabase
      .channel(`conversation-${conversationId}-${crypto.randomUUID()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conversationId}` }, () => {
        queryClient.invalidateQueries({ queryKey: key });
        markConversationSeen(conversationId, user.id);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'typing_presence', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        const presence = payload.new as { user_id?: string; is_typing?: boolean; updated_at?: string };
        if (presence.user_id === peerId) setPeerTyping(Boolean(presence.is_typing) && Date.now() - new Date(presence.updated_at ?? 0).getTime() < 5000);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, peerId, queryClient, user?.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.data?.length, peerTyping]);

  function messagePayload() {
    if (!user?.id || !conversationId) throw new Error('Conversation is not ready.');
    return { project_id: projectId, quotation_id: quotationId ?? null, conversation_id: conversationId, sender_id: user.id, receiver_id: peerId };
  }

  async function submitText() {
    if (!body.trim()) return;
    try {
      setSending(true);
      await sendMessage({ ...messagePayload(), message_type: 'text', body: body.trim(), image_url: null, file_url: null, file_name: null, mime_type: null });
      setBody('');
      if (conversationId && user?.id) await setTyping(conversationId, user.id, false);
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    } catch (error) {
      toast({ title: 'Message failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    } finally { setSending(false); }
  }

  async function submitImage(file?: File) {
    if (!file || !user?.id) return;
    try {
      setSending(true);
      const url = await uploadToBucket('chat-images', `${projectId}/${user.id}`, file);
      await sendMessage({ ...messagePayload(), message_type: 'image', body: null, image_url: url, file_url: null, file_name: null, mime_type: file.type });
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
    } catch (error) {
      toast({ title: 'Image failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    } finally { setSending(false); }
  }

  async function submitFile(file?: File) {
    if (!file || !user?.id) return;
    try {
      setSending(true);
      const path = await uploadPrivateFile('chat-files', `${conversationId}/${user.id}`, file);
      await sendMessage({ ...messagePayload(), message_type: 'file', body: null, image_url: null, file_url: path, file_name: file.name, mime_type: file.type });
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
    } catch (error) {
      toast({ title: 'File failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    } finally { setSending(false); }
  }

  async function openFile(path: string) {
    try { window.open(await createSignedFileUrl('chat-files', path), '_blank', 'noopener,noreferrer'); }
    catch (error) { toast({ title: 'Could not open file', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' }); }
  }

  function handleTyping(value: string) {
    setBody(value);
    if (!conversationId || !user?.id) return;
    setTyping(conversationId, user.id, Boolean(value)).catch(() => undefined);
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => setTyping(conversationId, user.id, false), 1800);
  }

  return (
    <Card>
      <CardHeader><CardTitle>Chat with {peerName}</CardTitle></CardHeader>
      <CardContent>
        <div className="mb-4 max-h-96 min-h-64 overflow-y-auto rounded-lg border bg-muted/40 p-3">
          <div className="grid gap-3">
            {messages.data?.length ? messages.data.map((message) => {
              const mine = message.sender_id === user?.id;
              return (
                <div key={message.id} className={cn('max-w-[82%] rounded-lg px-3 py-2 text-sm', mine ? 'ml-auto bg-primary text-primary-foreground' : 'bg-card')}>
                  {message.message_type === 'image' && message.image_url ? <img src={message.image_url} alt="Shared attachment" className="max-h-56 rounded-lg object-cover" /> : null}
                  {message.message_type === 'file' && message.file_url ? <button type="button" className="flex items-center gap-2 font-semibold underline-offset-2 hover:underline" onClick={() => openFile(message.file_url!)}><FileText className="h-4 w-4" />{message.file_name}</button> : null}
                  {message.message_type === 'text' ? message.body : null}
                  {mine && <span className="mt-1 flex justify-end opacity-75"><CheckCheck className={cn('h-3.5 w-3.5', message.seen_at && 'text-cyan-200')} /></span>}
                </div>
              );
            }) : <p className="py-10 text-center text-sm text-muted-foreground">No messages yet.</p>}
            {peerTyping && <p className="text-xs font-medium text-muted-foreground">{peerName} is typing...</p>}
            <div ref={bottomRef} />
          </div>
        </div>
        <div className="relative flex gap-2">
          <label title="Share image" className="focus-ring grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-lg border bg-card"><ImagePlus className="h-4 w-4" /><input type="file" accept="image/*" className="hidden" onChange={(event) => submitImage(event.target.files?.[0])} /></label>
          <label title="Share file" className="focus-ring grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-lg border bg-card"><Paperclip className="h-4 w-4" /><input type="file" accept=".pdf,.docx,image/*" className="hidden" onChange={(event) => submitFile(event.target.files?.[0])} /></label>
          <Button type="button" variant="secondary" size="icon" onClick={() => setEmojiOpen((value) => !value)} aria-label="Add emoji"><SmilePlus className="h-4 w-4" /></Button>
          {emojiOpen && (
            <div className="absolute bottom-12 left-20 z-10 flex gap-1 rounded-lg border bg-card p-2 shadow-panel">
              {['👍', '🙏', '😊', '✅', '🏗️', '📌'].map((emoji) => (
                <button key={emoji} type="button" className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted" onClick={() => { handleTyping(`${body}${emoji}`); setEmojiOpen(false); }}>
                  {emoji}
                </button>
              ))}
            </div>
          )}
          <Input value={body} onChange={(event) => handleTyping(event.target.value)} placeholder="Write a message" onKeyDown={(event) => event.key === 'Enter' && submitText()} />
          <Button type="button" size="icon" onClick={submitText} loading={sending} aria-label="Send message"><Send className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}
