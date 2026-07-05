import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Brain, Clock, Eye, Lightbulb, MessageSquareText, Send, X } from 'lucide-react';
import { ContractorWorkspace } from './ContractorWorkspace';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Field, Input, Select, Textarea } from '../../components/ui/forms';
import { Button } from '../../components/ui/button';
import { ChatPanel } from '../../components/chat/ChatPanel';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/toast';
import { cityOptions, constructionOptions, materialQualityOptions } from '../../lib/constants';
import { formatCurrency } from '../../lib/utils';
import { createContractorQuotation, listAvailableProjects, submitQuotation, type AvailableProjectFilters } from '../../services/contractors';
import { getConversation, sendMessage } from '../../services/chat';
import { uploadPrivateFile } from '../../services/storage';
import type { ChatMessage, ProjectWithHomeowner, Quotation } from '../../types';

type FilterForm = AvailableProjectFilters;
type QuoteForm = { amount: number; duration_days: number; warranty: string; notes: string; timeline: string; attachments?: FileList };

export function ContractorAvailableProjectsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<AvailableProjectFilters>({ sort: 'newest' });
  const [details, setDetails] = useState<ProjectWithHomeowner | null>(null);
  const [quoteTarget, setQuoteTarget] = useState<ProjectWithHomeowner | null>(null);
  const [chat, setChat] = useState<{ projectId: string; homeownerId: string; homeownerName: string; quotationId?: string | null } | null>(null);
  const filterForm = useForm<FilterForm>({ defaultValues: { sort: 'newest' } });
  const quoteForm = useForm<QuoteForm>({ defaultValues: { amount: 0, duration_days: 120, warranty: '1 year workmanship warranty', notes: '', timeline: 'Site visit, construction stages, finishing, handover.' } });
  const projects = useQuery({ queryKey: ['available-projects', user?.id, filters], queryFn: () => listAvailableProjects(user!.id, filters), enabled: Boolean(user?.id) });

  async function ensureQuotation(project: ProjectWithHomeowner) {
    if (!user?.id) throw new Error('Please sign in.');
    return createContractorQuotation(project, user.id);
  }

  async function startChat(project: ProjectWithHomeowner) {
    if (!user?.id || !project.homeowner_id) return;
    const quote = await ensureQuotation(project);
    setChat({ projectId: project.id, homeownerId: project.homeowner_id, homeownerName: project.homeowner?.name ?? 'Homeowner', quotationId: quote.id });
    queryClient.invalidateQueries({ queryKey: ['incoming-requests', user.id] });
  }

  async function submitQuote(values: QuoteForm) {
    if (!quoteTarget || !user?.id) return;
    try {
      const quote = await ensureQuotation(quoteTarget);
      await sendAvailableQuote(quoteTarget, quote, values, user.id);
      toast({ title: 'Quote sent', description: 'The homeowner received a notification and chat message.', type: 'success' });
      setQuoteTarget(null);
      projects.refetch();
      queryClient.invalidateQueries({ queryKey: ['incoming-requests', user.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
    } catch (error) {
      toast({ title: 'Quote failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    }
  }

  async function sendAvailableQuote(project: ProjectWithHomeowner, quote: Quotation, values: QuoteForm, userId: string) {
    await submitQuotation(quote.id, {
      amount: values.amount,
      duration_days: values.duration_days,
      timeline: values.timeline,
      notes: [`Warranty: ${values.warranty}`, values.notes].filter(Boolean).join('\n\n')
    });
    const conversation = await getConversation(project.id, project.homeowner_id, userId, quote.id);
    const baseMessage = { project_id: project.id, quotation_id: quote.id, conversation_id: conversation.id, sender_id: userId, receiver_id: project.homeowner_id };
    await sendMessage({ ...baseMessage, message_type: 'text', body: `Quotation sent: ${formatCurrency(values.amount)} for ${values.duration_days} days.\n${values.timeline}`, image_url: null, file_url: null, file_name: null, mime_type: null } as Omit<ChatMessage, 'id' | 'created_at' | 'seen_at'>);
    for (const file of Array.from(values.attachments ?? [])) {
      const path = await uploadPrivateFile('chat-files', `${conversation.id}/${userId}`, file);
      await sendMessage({ ...baseMessage, message_type: 'file', body: null, image_url: null, file_url: path, file_name: file.name, mime_type: file.type } as Omit<ChatMessage, 'id' | 'created_at' | 'seen_at'>);
    }
  }

  return (
    <ContractorWorkspace>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-bold">Available Projects</h1>
          <p className="mt-1 text-muted-foreground">Browse public homeowner projects and start quote conversations.</p>
        </div>
        <Card>
          <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-3 xl:grid-cols-6" onSubmit={filterForm.handleSubmit((values) => setFilters(values))}>
              <Field label="City"><Select {...filterForm.register('city')}><option value="">All cities</option>{cityOptions.map((city) => <option key={city}>{city}</option>)}</Select></Field>
              <Field label="Min budget"><Input type="number" {...filterForm.register('minBudget', { valueAsNumber: true })} /></Field>
              <Field label="Max budget"><Input type="number" {...filterForm.register('maxBudget', { valueAsNumber: true })} /></Field>
              <Field label="Plot size"><Input type="number" {...filterForm.register('plotSize', { valueAsNumber: true })} /></Field>
              <Field label="Material"><Select {...filterForm.register('materialQuality')}><option value="">All</option>{materialQualityOptions.map((option) => <option key={option}>{option}</option>)}</Select></Field>
              <Field label="Type"><Select {...filterForm.register('constructionType')}><option value="">All</option>{constructionOptions.map((option) => <option key={option}>{option}</option>)}</Select></Field>
              <Field label="Sort"><Select {...filterForm.register('sort')}><option value="newest">Newest</option><option value="highest_budget">Highest Budget</option><option value="nearest">Nearest</option></Select></Field>
              <div className="flex items-end"><Button className="w-full">Apply</Button></div>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {projects.data?.length ? projects.data.map((project) => (
            <Card key={project.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold">{project.title}</p>
                    <p className="text-sm text-muted-foreground">{project.homeowner?.name ?? 'Homeowner'} · {project.city} · {project.plot_size} marla · {project.covered_area} sq ft · {project.floors} floors</p>
                    <p className="mt-2 text-sm">{project.material_quality} · {project.construction_type}</p>
                    <p className="mt-2 font-semibold text-primary">{project.ai_estimate_json ? `${formatCurrency(project.ai_estimate_json.total_estimate_min)} - ${formatCurrency(project.ai_estimate_json.total_estimate_max)}` : 'Budget estimate unavailable'}</p>
                  </div>
                  <Badge>{project.status}</Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={() => setDetails(project)}><Eye className="h-4 w-4" /> View Project</Button>
                  <Button type="button" size="sm" onClick={() => setQuoteTarget(project)}><Send className="h-4 w-4" /> Send Quote</Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => startChat(project)}><MessageSquareText className="h-4 w-4" /> Start Chat</Button>
                </div>
              </CardContent>
            </Card>
          )) : <Card><CardContent className="p-8 text-center text-muted-foreground">No available projects found.</CardContent></Card>}
        </div>

        {chat && <ChatPanel projectId={chat.projectId} peerId={chat.homeownerId} quotationId={chat.quotationId} peerName={chat.homeownerName} />}
      </div>

      {details && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{details.title}</CardTitle>
                <CardDescription>{details.homeowner?.name ?? 'Homeowner'} · {details.city}</CardDescription>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setDetails(null)}><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project specs */}
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="Plot size" value={`${details.plot_size} marla`} />
                <Info label="Covered area" value={`${details.covered_area.toLocaleString()} sq ft`} />
                <Info label="Floors" value={`${details.floors}`} />
                <Info label="Basement" value={details.basement ? 'Yes' : 'No'} />
                <Info label="Soil type" value={details.soil_type ?? 'Not set'} />
                <Info label="Construction type" value={details.construction_type} />
                <Info label="Material quality" value={details.material_quality} />
                <Info label="Interior finish" value={details.interior_finish ?? 'Not set'} />
                <Info label="Exterior finish" value={details.exterior_finish ?? 'Not set'} />
                <Info label="Parking" value={details.parking ? 'Yes' : 'No'} />
                <Info label="Solar Power" value={details.solar ? 'Yes' : 'No'} />
                <Info label="Smart Home" value={details.smart_home ? 'Yes' : 'No'} />
                <Info label="Garden" value={details.garden ? 'Yes' : 'No'} />
                <Info label="Swimming Pool" value={details.swimming_pool ? 'Yes' : 'No'} />
              </div>

              {/* AI Estimate full breakdown */}
              {details.ai_estimate_json ? (
                <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-5 space-y-5">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15">
                      <Brain className="h-4 w-4 text-primary" />
                    </span>
                    <div>
                      <p className="font-bold">AI-Generated Estimate</p>
                      <p className="text-xs text-muted-foreground">Generated by BuildWise AI in PKR</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-xs text-muted-foreground">Budget Range</p>
                      <p className="font-bold text-primary text-lg">
                        {formatCurrency((details.ai_estimate_json as any).total_estimate_min)} – {formatCurrency((details.ai_estimate_json as any).total_estimate_max)}
                      </p>
                    </div>
                  </div>

                  {/* Cost line items */}
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {Object.entries(details.ai_estimate_json)
                      .filter(([k, v]) => typeof v === 'number' && v > 0 && !['total_estimate_min', 'total_estimate_max', 'confidence'].includes(k))
                      .map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between rounded-lg border bg-background/70 px-3 py-2 text-sm">
                          <span className="capitalize text-muted-foreground">{k.replace(/_cost$/, '').replace(/_/g, ' ')}</span>
                          <span className="font-bold">{formatCurrency(v as number)}</span>
                        </div>
                      ))}
                  </div>

                  {/* Timeline & confidence */}
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(details.ai_estimate_json as any).timeline && (
                      <div className="flex items-start gap-2 rounded-lg border bg-background/70 p-3">
                        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <div>
                          <p className="text-xs font-semibold uppercase text-muted-foreground">Timeline</p>
                          <p className="text-sm font-semibold">{(details.ai_estimate_json as any).timeline}</p>
                        </div>
                      </div>
                    )}
                    {(details.ai_estimate_json as any).confidence !== undefined && (
                      <div className="rounded-lg border bg-background/70 p-3">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">AI Confidence</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(details.ai_estimate_json as any).confidence}%` }} />
                          </div>
                          <span className="text-sm font-bold text-primary">{(details.ai_estimate_json as any).confidence}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Explanation */}
                  {(details.ai_estimate_json as any).explanation && (
                    <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-4">
                      <p className="mb-1 text-xs font-bold uppercase text-primary">AI Explanation</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{(details.ai_estimate_json as any).explanation}</p>
                    </div>
                  )}

                  {/* Suggestions */}
                  {Array.isArray((details.ai_estimate_json as any).suggestions) && (details.ai_estimate_json as any).suggestions.length > 0 && (
                    <div>
                      <div className="mb-2 flex items-center gap-1.5">
                        <Lightbulb className="h-3.5 w-3.5 text-emerald-500" />
                        <p className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">Cost-Saving Suggestions</p>
                      </div>
                      <ul className="space-y-1.5">
                        {(details.ai_estimate_json as any).suggestions.map((tip: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />{tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Risks */}
                  {Array.isArray((details.ai_estimate_json as any).risk_factors) && (details.ai_estimate_json as any).risk_factors.length > 0 && (
                    <div>
                      <div className="mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        <p className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400">Identified Risks</p>
                      </div>
                      <ul className="space-y-1.5">
                        {(details.ai_estimate_json as any).risk_factors.map((risk: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />{risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">
                  No AI estimate generated for this project yet.
                </p>
              )}

              {/* Action buttons inside modal */}
              <div className="flex gap-2 pt-2">
                <Button type="button" onClick={() => { setQuoteTarget(details); setDetails(null); }}>
                  <Send className="h-4 w-4" /> Send Quote
                </Button>
                <Button type="button" variant="secondary" onClick={() => { startChat(details); setDetails(null); }}>
                  <MessageSquareText className="h-4 w-4" /> Start Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}


      {quoteTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-start justify-between gap-4"><div><CardTitle>Send Quote</CardTitle><CardDescription>{quoteTarget.title}</CardDescription></div><Button type="button" variant="ghost" size="icon" onClick={() => setQuoteTarget(null)}><X className="h-4 w-4" /></Button></CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={quoteForm.handleSubmit(submitQuote)}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Estimated Price"><Input type="number" {...quoteForm.register('amount', { valueAsNumber: true, min: 1 })} /></Field>
                  <Field label="Construction Duration"><Input type="number" {...quoteForm.register('duration_days', { valueAsNumber: true, min: 1 })} /></Field>
                </div>
                <Field label="Warranty"><Input {...quoteForm.register('warranty')} /></Field>
                <Field label="Notes"><Textarea {...quoteForm.register('notes')} /></Field>
                <Field label="Attachments"><Input type="file" multiple accept=".pdf,.doc,.docx,image/*" {...quoteForm.register('attachments')} /></Field>
                <Field label="Timeline"><Textarea {...quoteForm.register('timeline')} /></Field>
                <Button>Submit</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </ContractorWorkspace>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border bg-background p-3"><p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p></div>;
}
