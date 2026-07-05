import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquareText } from 'lucide-react';
import { ContractorWorkspace } from './ContractorWorkspace';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ChatPanel } from '../../components/chat/ChatPanel';
import { useAuth } from '../../contexts/AuthContext';
import { listConversationsForUser } from '../../services/chat';
import { cn } from '../../lib/utils';

function getPeerName(conversation: any, userId: string) {
  if (conversation.homeowner_id === userId) {
    return conversation.contractor?.name ?? conversation.supplier?.name ?? 'Partner';
  }
  return conversation.homeowner?.name ?? 'Homeowner';
}

function getPeerId(conversation: any, userId: string) {
  if (conversation.homeowner_id === userId) {
    return conversation.contractor_id ?? conversation.supplier_id;
  }
  return conversation.homeowner_id;
}

export function ContractorMessagesPage() {
  const { user, profile } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const conversations = useQuery({ queryKey: ['conversations', user?.id], queryFn: () => listConversationsForUser(user!.id), enabled: Boolean(user?.id) });
  const selected = useMemo(() => conversations.data?.find((conversation) => conversation.id === selectedId) ?? conversations.data?.[0], [conversations.data, selectedId]);

  const desc = profile?.role === 'homeowner'
    ? 'Reply to contractors and suppliers, share images, PDFs, and documents, and track seen status in real time.'
    : 'Reply to homeowners, share images, PDFs, and documents, and track seen status in real time.';

  return (
    <ContractorWorkspace>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="mt-1 text-muted-foreground">{desc}</p>
        </div>
        <div className="grid min-h-[36rem] gap-4 lg:grid-cols-[20rem_1fr]">
          <Card className="overflow-hidden">
            <CardHeader><CardTitle>Conversations</CardTitle></CardHeader>
            <CardContent className="grid max-h-[38rem] gap-2 overflow-y-auto p-3 pt-0">
              {conversations.data?.length ? conversations.data.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setSelectedId(conversation.id)}
                  className={cn('rounded-lg border p-3 text-left hover:bg-muted', selected?.id === conversation.id && 'border-primary bg-primary/10')}
                >
                  <p className="font-semibold">{getPeerName(conversation, user!.id)}</p>
                  <p className="line-clamp-1 text-sm text-muted-foreground">{conversation.projects?.title ?? 'Project conversation'}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{new Date(conversation.last_message_at).toLocaleString()}</p>
                </button>
              )) : <p className="p-6 text-center text-sm text-muted-foreground">No conversations yet.</p>}
            </CardContent>
          </Card>
          {selected ? (
            <ChatPanel projectId={selected.project_id} peerId={getPeerId(selected, user!.id)} quotationId={selected.quotation_id} peerName={getPeerName(selected, user!.id)} />
          ) : (
            <Card>
              <CardContent className="grid min-h-[28rem] place-items-center text-center text-muted-foreground">
                <div>
                  <MessageSquareText className="mx-auto h-8 w-8" />
                  <p className="mt-3 font-semibold">Select a conversation</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ContractorWorkspace>
  );
}
