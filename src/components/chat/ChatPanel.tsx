import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { listMessages, sendMessage } from '../../services/chat';
import { uploadToBucket } from '../../services/storage';
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
  const key = ['messages', projectId, peerId, user?.id];
  const messages = useQuery({
    queryKey: key,
    queryFn: () => listMessages(projectId, peerId, user!.id),
    enabled: Boolean(user?.id && peerId && projectId)
  });

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`project-chat-${projectId}-${peerId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `project_id=eq.${projectId}` }, () => {
        queryClient.invalidateQueries({ queryKey: key });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [key, peerId, projectId, queryClient, user?.id]);

  async function submitText() {
    if (!body.trim() || !user?.id) return;
    try {
      setSending(true);
      await sendMessage({ project_id: projectId, quotation_id: quotationId ?? null, sender_id: user.id, receiver_id: peerId, message_type: 'text', body, image_url: null });
      setBody('');
      queryClient.invalidateQueries({ queryKey: key });
    } catch (error) {
      toast({ title: 'Message failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    } finally {
      setSending(false);
    }
  }

  async function submitImage(file?: File) {
    if (!file || !user?.id) return;
    try {
      setSending(true);
      const url = await uploadToBucket('chat-images', `${projectId}/${user.id}`, file);
      await sendMessage({ project_id: projectId, quotation_id: quotationId ?? null, sender_id: user.id, receiver_id: peerId, message_type: 'image', body: null, image_url: url });
      queryClient.invalidateQueries({ queryKey: key });
    } catch (error) {
      toast({ title: 'Image message failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat with {peerName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid max-h-80 gap-3 overflow-y-auto rounded-xl border bg-muted/40 p-3">
          {messages.data?.length ? (
            messages.data.map((message) => (
              <div key={message.id} className={cn('max-w-[82%] rounded-xl px-3 py-2 text-sm', message.sender_id === user?.id ? 'ml-auto bg-primary text-primary-foreground' : 'bg-card')}>
                {message.message_type === 'image' && message.image_url ? <img src={message.image_url} alt="Chat upload" className="max-h-48 rounded-lg object-cover" /> : message.body}
              </div>
            ))
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">No messages yet.</p>
          )}
        </div>
        <div className="flex gap-2">
          <label className="focus-ring grid h-10 w-10 cursor-pointer place-items-center rounded-lg border bg-card">
            <ImagePlus className="h-4 w-4" />
            <input type="file" accept="image/*" className="hidden" onChange={(event) => submitImage(event.target.files?.[0])} />
          </label>
          <Input value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a message" onKeyDown={(event) => event.key === 'Enter' && submitText()} />
          <Button size="icon" onClick={submitText} loading={sending} aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
