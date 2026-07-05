import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Brain, ChevronDown, ChevronUp, MessageSquareText, TrendingUp, AlertTriangle, Lightbulb, Clock } from 'lucide-react';
import { ContractorWorkspace } from './ContractorWorkspace';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ChatPanel } from '../../components/chat/ChatPanel';
import { RequireRole } from '../../lib/requireRole';
import { useAuth } from '../../contexts/AuthContext';
import { listConversationsForUser } from '../../services/chat';
import { cn, formatCurrency } from '../../lib/utils';

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

function EstimatePanel({ project }: { project: any }) {
  const [open, setOpen] = useState(true);
  const est = project?.ai_estimate_json as any;
  if (!est) return null;

  const costItems = Object.entries(est).filter(
    ([k, v]) => typeof v === 'number' && v > 0 && !['total_estimate_min', 'total_estimate_max', 'confidence'].includes(k)
  );

  return (
    <div className="rounded-xl border bg-gradient-to-br from-primary/5 via-background to-primary/10 overflow-hidden">
      {/* Header toggle */}
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-primary/5 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
            <Brain className="h-4 w-4 text-primary" />
          </span>
          <div>
            <p className="font-bold text-sm">AI-Generated Estimate</p>
            <p className="text-xs text-muted-foreground">{project?.title ?? 'Project'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Budget Range</p>
            <p className="font-bold text-primary text-sm">
              {formatCurrency(est.total_estimate_min)} – {formatCurrency(est.total_estimate_max)}
            </p>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5 border-t">
          {/* Project specs */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-4">
            {[
              { label: 'Plot Size', value: project.plot_size ? `${project.plot_size} marla` : '—' },
              { label: 'Covered Area', value: project.covered_area ? `${project.covered_area.toLocaleString()} sq ft` : '—' },
              { label: 'Floors', value: project.floors ?? '—' },
              { label: 'City', value: project.city ?? '—' },
              { label: 'Material', value: project.material_quality ?? '—' },
              { label: 'Type', value: project.construction_type ?? '—' },
              { label: 'Interior', value: project.interior_finish ?? '—' },
              { label: 'Exterior', value: project.exterior_finish ?? '—' },
            ].map(item => (
              <div key={item.label} className="rounded-lg border bg-background/70 p-2">
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">{item.label}</p>
                <p className="mt-0.5 text-sm font-semibold">{String(item.value)}</p>
              </div>
            ))}
          </div>

          {/* Features */}
          {(() => {
            const feats = ['Basement','Solar','Parking','Smart Home','Garden','Swimming Pool'].filter((_, i) =>
              [project.basement, project.solar, project.parking, project.smart_home, project.garden, project.swimming_pool][i]
            );
            return feats.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {feats.map(f => (
                  <span key={f} className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {f}
                  </span>
                ))}
              </div>
            ) : null;
          })()}

          {/* Cost breakdown */}
          {costItems.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs font-bold uppercase text-muted-foreground">Cost Breakdown</p>
              </div>
              <div className="grid gap-1 sm:grid-cols-2">
                {costItems.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between rounded-lg border bg-background/70 px-3 py-1.5 text-sm">
                    <span className="capitalize text-muted-foreground">{k.replace(/_cost$/, '').replace(/_/g, ' ')}</span>
                    <span className="font-bold text-foreground">{formatCurrency(v as number)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between rounded-xl border-2 border-primary/30 bg-primary/10 px-4 py-2.5">
                <span className="font-bold text-sm">Total Estimate</span>
                <span className="font-bold text-primary">{formatCurrency(est.total_estimate_min)} – {formatCurrency(est.total_estimate_max)}</span>
              </div>
            </div>
          )}

          {/* Timeline & confidence */}
          <div className="grid gap-2 sm:grid-cols-2">
            {est.timeline && (
              <div className="flex items-start gap-2 rounded-lg border bg-background/70 p-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Timeline</p>
                  <p className="text-sm font-semibold">{est.timeline}</p>
                </div>
              </div>
            )}
            {est.confidence !== undefined && (
              <div className="rounded-lg border bg-background/70 p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">AI Confidence</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${est.confidence}%` }} />
                  </div>
                  <span className="text-sm font-bold text-primary">{est.confidence}%</span>
                </div>
              </div>
            )}
          </div>

          {/* AI explanation */}
          {est.explanation && (
            <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-4">
              <p className="mb-1 text-xs font-bold uppercase text-primary">AI Explanation</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{est.explanation}</p>
            </div>
          )}

          {/* Suggestions */}
          {Array.isArray(est.suggestions) && est.suggestions.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-emerald-500" />
                <p className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">Cost-Saving Suggestions</p>
              </div>
              <ul className="space-y-1.5">
                {est.suggestions.map((tip: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk factors */}
          {Array.isArray(est.risk_factors) && est.risk_factors.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <p className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400">Identified Risks</p>
              </div>
              <ul className="space-y-1.5">
                {est.risk_factors.map((risk: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ContractorMessagesPage() {
  const { user, profile } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const conversations = useQuery({ queryKey: ['conversations', user?.id], queryFn: () => listConversationsForUser(user!.id), enabled: Boolean(user?.id) });
  const selected = useMemo(() => conversations.data?.find((c) => c.id === selectedId) ?? conversations.data?.[0], [conversations.data, selectedId]);

  const desc = profile?.role === 'homeowner'
    ? 'Reply to contractors and suppliers, share images, PDFs, and documents, and track seen status in real time.'
    : 'Reply to homeowners, share images, PDFs, and documents, and track seen status in real time.';

  return (
    <RequireRole allowedRoles={['contractor']}>
      <ContractorWorkspace>
        <div className="grid gap-6">
          <div>
            <h1 className="text-3xl font-bold">Messages</h1>
            <p className="mt-1 text-muted-foreground">{desc}</p>
          </div>
          <div className="grid min-h-[36rem] gap-4 lg:grid-cols-[20rem_1fr]">
            {/* Sidebar – conversation list */}
            <Card className="overflow-hidden">
              <CardHeader><CardTitle>Conversations</CardTitle></CardHeader>
              <CardContent className="grid max-h-[38rem] gap-2 overflow-y-auto p-3 pt-0">
                {conversations.data?.length ? conversations.data.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setSelectedId(conversation.id)}
                    className={cn('rounded-lg border p-3 text-left hover:bg-muted transition-colors', selected?.id === conversation.id && 'border-primary bg-primary/10')}
                  >
                    <p className="font-semibold">{getPeerName(conversation, user!.id)}</p>
                    <p className="line-clamp-1 text-sm text-muted-foreground">{conversation.projects?.title ?? 'Project conversation'}</p>
                    {(conversation.projects as any)?.ai_estimate_json && (
                      <p className="mt-1 text-xs font-semibold text-primary">
                        AI Est: {formatCurrency((conversation.projects as any).ai_estimate_json.total_estimate_min)} – {formatCurrency((conversation.projects as any).ai_estimate_json.total_estimate_max)}
                      </p>
                    )}
                    <p className="mt-1.5 text-xs text-muted-foreground">{new Date(conversation.last_message_at).toLocaleString()}</p>
                  </button>
                )) : <p className="p-6 text-center text-sm text-muted-foreground">No conversations yet.</p>}
              </CardContent>
            </Card>

            {/* Main area – estimate + chat */}
            {selected ? (
              <div className="flex flex-col gap-4 min-h-0">
                {/* AI Estimate panel (collapsible) */}
                <EstimatePanel project={selected.projects} />
                {/* Chat */}
                <ChatPanel
                  projectId={selected.project_id}
                  peerId={getPeerId(selected, user!.id)}
                  quotationId={selected.quotation_id}
                  peerName={getPeerName(selected, user!.id)}
                />
              </div>
            ) : (
              <Card>
                <CardContent className="grid min-h-[28rem] place-items-center text-center text-muted-foreground">
                  <div>
                    <MessageSquareText className="mx-auto h-8 w-8" />
                    <p className="mt-3 font-semibold">Select a conversation</p>
                    <p className="mt-1 text-sm">The AI estimate and chat will appear here.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </ContractorWorkspace>
    </RequireRole>
  );
}
