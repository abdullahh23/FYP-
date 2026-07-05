import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Eye, MessageSquareText, Send, X } from 'lucide-react';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Field, Input, Select, Textarea } from '../../components/ui/forms';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/toast';
import { getContractorProfile, listIncomingRequests, rejectQuotation, submitQuotation, upsertContractorProfile } from '../../services/contractors';
import { getConversation, listConversationsForUser, sendMessage } from '../../services/chat';
import { uploadPrivateFile, uploadToBucket } from '../../services/storage';
import { ChatPanel } from '../../components/chat/ChatPanel';
import { formatCurrency } from '../../lib/utils';
import { projectProgressStages } from '../../lib/constants';
import { updateProjectProgress } from '../../services/projects';
import { ContractorWorkspace } from './ContractorWorkspace';
import type { ChatMessage, Profile, Project, ProjectProgressStage, Quotation } from '../../types';

type ProfileForm = {
  experience_years: number;
  specialization: string;
  bio: string;
  completed_projects: number;
  min_budget: number;
  max_budget: number;
  material_quality_preferences: string;
};

type QuoteForm = { amount: number; duration_days: number; warranty: string; notes: string; timeline: string; attachments?: FileList };
type RequestRow = Quotation & { projects: Project | null; homeowner: Profile | null };
type ChatTarget = { projectId: string; homeownerId: string; homeownerName: string; quotationId?: string | null };

function requestedFeatures(project?: Project | null) {
  if (!project) return [];
  return [
    project.basement && 'Basement',
    project.solar && 'Solar',
    project.parking && 'Parking',
    project.smart_home && 'Smart Home',
    project.garden && 'Garden',
    project.swimming_pool && 'Swimming Pool'
  ].filter(Boolean) as string[];
}

export function ContractorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [chat, setChat] = useState<ChatTarget | null>(null);
  const [details, setDetails] = useState<RequestRow | null>(null);
  const [quoteTarget, setQuoteTarget] = useState<RequestRow | null>(null);
  const [fullDetail, setFullDetail] = useState<RequestRow | null>(null);
  const [progressSelections, setProgressSelections] = useState<Record<string, ProjectProgressStage>>({});

  const contractorProfile = useQuery({ queryKey: ['contractor-profile', user?.id], queryFn: () => getContractorProfile(user!.id), enabled: Boolean(user?.id) });
  const requests = useQuery({ queryKey: ['incoming-requests', user?.id], queryFn: () => listIncomingRequests(user!.id), enabled: Boolean(user?.id) });
  const conversations = useQuery({ queryKey: ['conversations', user?.id], queryFn: () => listConversationsForUser(user!.id), enabled: Boolean(user?.id) });

  const form = useForm<ProfileForm>({
    values: {
      experience_years: contractorProfile.data?.experience_years ?? 0,
      specialization: contractorProfile.data?.specialization ?? 'Residential Construction',
      bio: contractorProfile.data?.bio ?? '',
      completed_projects: contractorProfile.data?.completed_projects ?? 0,
      min_budget: contractorProfile.data?.min_budget ?? 0,
      max_budget: contractorProfile.data?.max_budget ?? 0,
      material_quality_preferences: contractorProfile.data?.material_quality_preferences?.join(', ') ?? 'Economy, Standard, Premium, Luxury'
    }
  });
  const quoteForm = useForm<QuoteForm>({
    defaultValues: { amount: 0, duration_days: 120, warranty: '1 year workmanship warranty', notes: '', timeline: 'Mobilization, site visit, construction stages, finishing, handover.' }
  });

  useEffect(() => {
    if (quoteTarget) {
      quoteForm.reset({ amount: quoteTarget.amount ?? 0, duration_days: quoteTarget.duration_days ?? 120, warranty: '1 year workmanship warranty', notes: quoteTarget.notes ?? '', timeline: quoteTarget.timeline ?? 'Mobilization, site visit, construction stages, finishing, handover.' });
    }
  }, [quoteForm, quoteTarget]);

  const rows = (requests.data ?? []) as RequestRow[];
  const overview = useMemo(() => {
    const accepted = rows.filter((request) => request.status === 'accepted');
    const active = accepted.filter((request) => request.projects?.progress_stage !== 'Completed');
    return [
      { label: 'Total Requests', value: rows.length },
      { label: 'Pending Requests', value: rows.filter((request) => request.status === 'pending').length },
      { label: 'Accepted Projects', value: accepted.length },
      { label: 'Active Projects', value: active.length },
      { label: 'Completed Projects', value: accepted.filter((request) => request.projects?.progress_stage === 'Completed').length },
      { label: 'Total Earnings', value: formatCurrency(accepted.reduce((total, request) => total + Number(request.amount ?? 0), 0)) }
    ];
  }, [rows]);

  const saveProfile = useMutation({
    mutationFn: async (values: ProfileForm) => upsertContractorProfile(user!.id, { ...values, material_quality_preferences: values.material_quality_preferences.split(',').map((value) => value.trim()).filter(Boolean), portfolio_urls: contractorProfile.data?.portfolio_urls ?? [], average_rating: contractorProfile.data?.average_rating ?? 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-profile', user?.id] });
      toast({ title: 'Contractor profile saved', type: 'success' });
      navigate('/dashboard');
    },
    onError: (error) => toast({ title: 'Profile save failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' })
  });

  async function uploadPortfolio(file?: File) {
    if (!file || !user?.id) return;
    try {
      const url = await uploadToBucket('portfolio-images', user.id, file);
      await upsertContractorProfile(user.id, {
        ...(contractorProfile.data ?? { user_id: user.id, experience_years: 0, specialization: 'Residential Construction', completed_projects: 0, average_rating: 0, material_quality_preferences: ['Economy', 'Standard', 'Premium', 'Luxury'] }),
        portfolio_urls: [...(contractorProfile.data?.portfolio_urls ?? []), url]
      });
      queryClient.invalidateQueries({ queryKey: ['contractor-profile', user.id] });
      toast({ title: 'Portfolio image uploaded', type: 'success' });
    } catch (error) {
      toast({ title: 'Upload failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    }
  }

  async function openChat(request: RequestRow) {
    if (!request.homeowner?.id) return;
    setChat({ projectId: request.project_id, homeownerId: request.homeowner.id, homeownerName: request.homeowner.name ?? 'Homeowner', quotationId: request.id });
    setTimeout(() => document.getElementById('contractor-chat')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  async function setProjectProgress(projectId: string) {
    const stage = progressSelections[projectId];
    if (!stage) return;
    try {
      await updateProjectProgress(projectId, stage);
      toast({ title: 'Project progress updated', type: 'success' });
      requests.refetch();
    } catch (error) {
      toast({ title: 'Progress update failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    }
  }

  async function sendQuote(values: QuoteForm) {
    if (!quoteTarget || !user?.id || !quoteTarget.homeowner?.id) return;
    try {
      const notes = [`Warranty: ${values.warranty}`, values.notes].filter(Boolean).join('\n\n');
      await submitQuotation(quoteTarget.id, { amount: values.amount, duration_days: values.duration_days, notes, timeline: values.timeline });
      const conversation = await getConversation(quoteTarget.project_id, quoteTarget.homeowner.id, user.id, quoteTarget.id);
      const baseMessage = {
        project_id: quoteTarget.project_id,
        quotation_id: quoteTarget.id,
        conversation_id: conversation.id,
        sender_id: user.id,
        receiver_id: quoteTarget.homeowner.id
      };
      await sendMessage({ ...baseMessage, message_type: 'text', body: `Quotation sent: ${formatCurrency(values.amount)} for ${values.duration_days} days.\n${values.timeline}`, image_url: null, file_url: null, file_name: null, mime_type: null } as Omit<ChatMessage, 'id' | 'created_at' | 'seen_at'>);
      for (const file of Array.from(values.attachments ?? [])) {
        const path = await uploadPrivateFile('chat-files', `${conversation.id}/${user.id}`, file);
        await sendMessage({ ...baseMessage, message_type: 'file', body: null, image_url: null, file_url: path, file_name: file.name, mime_type: file.type } as Omit<ChatMessage, 'id' | 'created_at' | 'seen_at'>);
      }
      toast({ title: 'Quotation sent', description: 'The homeowner received the quote, chat message, and notification.', type: 'success' });
      setQuoteTarget(null);
      quoteForm.reset();
      requests.refetch();
      queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
    } catch (error) {
      toast({ title: 'Quotation failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    }
  }

  async function rejectRequest(quotationId: string) {
    try {
      await rejectQuotation(quotationId);
      toast({ title: 'Request rejected', type: 'success' });
      requests.refetch();
    } catch (error) {
      toast({ title: 'Reject failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    }
  }

  return (
    <ContractorWorkspace>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-bold">Contractor Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Manage homeowner requests, quotations, chat, progress, and your contractor profile.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {overview.map((item) => (
            <Card key={item.label}>
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-2xl font-bold">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <Card>
            <CardHeader>
              <CardTitle>Contractor profile</CardTitle>
              <CardDescription>After saving, you stay on the complete contractor dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={form.handleSubmit((values) => saveProfile.mutate(values))}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Experience years"><Input type="number" {...form.register('experience_years', { valueAsNumber: true })} /></Field>
                  <Field label="Completed projects"><Input type="number" {...form.register('completed_projects', { valueAsNumber: true })} /></Field>
                  <Field label="Minimum budget"><Input type="number" {...form.register('min_budget', { valueAsNumber: true })} /></Field>
                  <Field label="Maximum budget"><Input type="number" {...form.register('max_budget', { valueAsNumber: true })} /></Field>
                </div>
                <Field label="Specialization"><Input {...form.register('specialization')} /></Field>
                <Field label="Preferred material qualities"><Input placeholder="Economy, Standard, Premium, Luxury" {...form.register('material_quality_preferences')} /></Field>
                <Field label="Bio"><Textarea {...form.register('bio')} /></Field>
                <Button loading={saveProfile.isPending}>Save profile</Button>
              </form>
              <div className="mt-5">
                <label className="focus-ring inline-flex cursor-pointer items-center rounded-lg border px-4 py-2 text-sm font-semibold">
                  Upload portfolio image
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => uploadPortfolio(event.target.files?.[0])} />
                </label>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {contractorProfile.data?.portfolio_urls?.map((url) => <img key={url} src={url} alt="Portfolio" className="aspect-square rounded-lg object-cover" />)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Homeowner Requests</CardTitle>
                <CardDescription>All quotation requests sent by homeowners.</CardDescription>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={() => navigate('/dashboard/available-projects')}>Browse projects</Button>
            </CardHeader>
            <CardContent className="grid gap-4">
              {rows.length ? rows.map((request) => {
                const project = request.projects;
                const features = requestedFeatures(project);
                return (
                  <div key={request.id} className="rounded-xl border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold">{request.homeowner?.name ?? 'Homeowner'}</p>
                          <Badge>{request.status}</Badge>
                        </div>
                        <p className="mt-1 text-sm font-semibold">{project?.title ?? 'Project request'}</p>
                        <p className="text-sm text-muted-foreground">{project?.city ?? 'City not set'} · {project?.plot_size ?? 0} marla · {project?.covered_area ?? 0} sq ft · {project?.floors ?? 0} floors</p>
                        <p className="text-sm text-muted-foreground">{project?.material_quality ?? 'Material quality'} · {project?.construction_type ?? 'Construction type'}</p>
                        <p className="mt-2 text-sm font-semibold text-primary">Estimated budget: {project?.ai_estimate_json ? `${formatCurrency(project.ai_estimate_json.total_estimate_min)} - ${formatCurrency(project.ai_estimate_json.total_estimate_max)}` : 'Not estimated yet'}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" /> Requested {new Date(request.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {features.length > 0 && <p className="mt-3 text-sm text-muted-foreground">Features: {features.join(', ')}</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="secondary" onClick={() => setDetails(request)}><Eye className="h-4 w-4" /> View Details</Button>
                      <Button type="button" size="sm" onClick={() => setQuoteTarget(request)}><Send className="h-4 w-4" /> Send Quote</Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => openChat(request)}><MessageSquareText className="h-4 w-4" /> Chat</Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => setFullDetail(request)}><Eye className="h-4 w-4" /> View Estimate</Button>
                      <Button type="button" size="sm" variant="danger" onClick={() => rejectRequest(request.id)}>Reject</Button>
                    </div>
                    {request.status === 'accepted' && (
                      <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                        <Select className="min-w-52 flex-1" value={progressSelections[request.project_id] ?? project?.progress_stage ?? 'Planning'} onChange={(event) => setProgressSelections((current) => ({ ...current, [request.project_id]: event.target.value as ProjectProgressStage }))}>
                          {projectProgressStages.map((stage) => <option key={stage}>{stage}</option>)}
                        </Select>
                        <Button type="button" size="sm" onClick={() => setProjectProgress(request.project_id)}>Update progress</Button>
                      </div>
                    )}
                  </div>
                );
              }) : <p className="rounded-xl border p-6 text-center text-muted-foreground">No incoming requests yet.</p>}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>Open a homeowner conversation and reply with text, images, PDFs, or documents.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {conversations.data?.length ? conversations.data.slice(0, 6).map((thread) => (
              <button key={thread.id} type="button" className="rounded-xl border p-4 text-left hover:bg-muted" onClick={() => setChat({ projectId: thread.project_id, homeownerId: thread.homeowner_id, homeownerName: thread.homeowner?.name ?? 'Homeowner', quotationId: thread.quotation_id })}>
                <p className="font-semibold">{thread.homeowner?.name ?? 'Homeowner'}</p>
                <p className="text-sm text-muted-foreground">{thread.projects?.title ?? 'Project conversation'}</p>
                <p className="mt-2 text-xs text-muted-foreground">{new Date(thread.last_message_at).toLocaleString()}</p>
              </button>
            )) : <p className="rounded-xl border p-6 text-center text-muted-foreground md:col-span-2 xl:col-span-3">No conversations yet.</p>}
          </CardContent>
        </Card>

        {chat && <div id="contractor-chat"><ChatPanel projectId={chat.projectId} peerId={chat.homeownerId} quotationId={chat.quotationId} peerName={chat.homeownerName} /></div>}
      </div>

      {details && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Homeowner Profile</CardTitle>
                <CardDescription>Project and homeowner context for this request.</CardDescription>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setDetails(null)}><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="Name" value={details.homeowner?.name ?? 'Homeowner'} />
                <Info label="City" value={details.projects?.city ?? details.homeowner?.city ?? 'Not set'} />
                <Info label="Project Title" value={details.projects?.title ?? 'Project request'} />
                <Info label="AI Estimate Budget" value={details.projects?.ai_estimate_json ? `${formatCurrency((details.projects.ai_estimate_json as any).total_estimate_min)} - ${formatCurrency((details.projects.ai_estimate_json as any).total_estimate_max)}` : 'Not estimated'} />
                <Info label="Plot Size" value={details.projects?.plot_size ? `${details.projects.plot_size} marla` : 'Not set'} />
                <Info label="Covered Area" value={details.projects?.covered_area ? `${details.projects.covered_area.toLocaleString()} sq ft` : 'Not set'} />
                <Info label="Floors" value={details.projects?.floors ? String(details.projects.floors) : 'Not set'} />
                <Info label="Basement" value={details.projects?.basement ? 'Yes' : 'No'} />
                <Info label="Soil Type" value={details.projects?.soil_type ?? 'Not set'} />
                <Info label="Construction Type" value={details.projects?.construction_type ?? 'Not set'} />
                <Info label="Preferred Material Quality" value={details.projects?.material_quality ?? 'Not set'} />
                <Info label="Interior Finish" value={details.projects?.interior_finish ?? 'Not set'} />
                <Info label="Exterior Finish" value={details.projects?.exterior_finish ?? 'Not set'} />
                <Info label="Parking" value={details.projects?.parking ? 'Yes' : 'No'} />
                <Info label="Solar Power" value={details.projects?.solar ? 'Yes' : 'No'} />
                <Info label="Smart Home" value={details.projects?.smart_home ? 'Yes' : 'No'} />
                <Info label="Garden" value={details.projects?.garden ? 'Yes' : 'No'} />
                <Info label="Swimming Pool" value={details.projects?.swimming_pool ? 'Yes' : 'No'} />
              </div>
              
              {details.projects?.ai_estimate_json && (
                <div className="mt-6 border-t pt-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-primary">AI Estimate Breakdown</h3>
                    <p className="text-sm text-muted-foreground">The cost breakdown generated by BuildWise AI in PKR.</p>
                  </div>
                  
                  <div className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(details.projects.ai_estimate_json)
                      .filter(([key, val]) => typeof val === 'number' && val > 0 && !['total_estimate_min', 'total_estimate_max', 'confidence'].includes(key))
                      .map(([key, val]) => (
                        <div key={key} className="flex justify-between border-b pb-1 text-sm">
                          <span className="capitalize text-muted-foreground">{key.replace(/_cost$/, '').replace(/_/g, ' ')}</span>
                          <span className="font-semibold">{formatCurrency(val as number)}</span>
                        </div>
                      ))
                    }
                  </div>

                  {(details.projects.ai_estimate_json as any).explanation && (
                    <div className="rounded-lg bg-muted p-4 text-sm">
                      <p className="font-semibold text-primary mb-1">AI Explanation</p>
                      <p className="text-muted-foreground leading-relaxed">{(details.projects.ai_estimate_json as any).explanation}</p>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    {(details.projects.ai_estimate_json as any).timeline && (
                      <Info label="Estimated Timeline" value={(details.projects.ai_estimate_json as any).timeline} />
                    )}
                    {(details.projects.ai_estimate_json as any).confidence !== undefined && (
                      <Info label="AI Confidence" value={`${(details.projects.ai_estimate_json as any).confidence}%`} />
                    )}
                  </div>

                  {Array.isArray((details.projects.ai_estimate_json as any).suggestions) && (details.projects.ai_estimate_json as any).suggestions.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-primary mb-2">Cost-Saving Suggestions</p>
                      <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                        {(details.projects.ai_estimate_json as any).suggestions.map((tip: string, i: number) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray((details.projects.ai_estimate_json as any).risk_factors) && (details.projects.ai_estimate_json as any).risk_factors.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-amber-600 dark:text-amber-500 mb-2">Identified Risks</p>
                      <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                        {(details.projects.ai_estimate_json as any).risk_factors.map((risk: string, i: number) => (
                          <li key={i}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {details.request_notes && <Info label="Request notes" value={details.request_notes} />}
            </CardContent>
          </Card>
        </div>
      )}

      {fullDetail && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <Card className="max-h-[95vh] w-full max-w-4xl overflow-y-auto">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Estimate & Conversation</CardTitle>
                <CardDescription>Full AI estimate and chat with homeowner.</CardDescription>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setFullDetail(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="Name" value={fullDetail.homeowner?.name ?? 'Homeowner'} />
                <Info label="City" value={fullDetail.projects?.city ?? 'Not set'} />
                <Info label="Project Title" value={fullDetail.projects?.title ?? 'Project request'} />
                <Info label="AI Estimate Budget" value={fullDetail.projects?.ai_estimate_json ? `${formatCurrency((fullDetail.projects.ai_estimate_json as any).total_estimate_min)} - ${formatCurrency((fullDetail.projects.ai_estimate_json as any).total_estimate_max)}` : 'Not estimated'} />
              </div>
              {fullDetail.projects?.ai_estimate_json && (
                <div className="mt-4 border-t pt-4">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(fullDetail.projects.ai_estimate_json)
                      .filter(([key, val]) => typeof val === 'number' && val > 0 && !['total_estimate_min', 'total_estimate_max', 'confidence'].includes(key))
                      .map(([key, val]) => (
                        <div key={key} className="flex justify-between border-b pb-1 text-sm">
                          <span className="capitalize text-muted-foreground">{key.replace(/_cost$/, '').replace(/_/g, ' ')}</span>
                          <span className="font-semibold">{formatCurrency(val as number)}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
              <ChatPanel projectId={fullDetail.projects?.id} peerId={fullDetail.homeowner?.id!} quotationId={fullDetail.id} peerName={fullDetail.homeowner?.name ?? 'Homeowner'} />
            </CardContent>
          </Card>
        </div>
      )}

      {quoteTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Send Quote</CardTitle>
                <CardDescription>{quoteTarget.projects?.title ?? 'Project request'} · {quoteTarget.homeowner?.name ?? 'Homeowner'}</CardDescription>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setQuoteTarget(null)}><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={quoteForm.handleSubmit(sendQuote)}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Estimated Price"><Input type="number" {...quoteForm.register('amount', { valueAsNumber: true, min: 1 })} /></Field>
                  <Field label="Construction Duration"><Input type="number" {...quoteForm.register('duration_days', { valueAsNumber: true, min: 1 })} /></Field>
                </div>
                <Field label="Warranty"><Input {...quoteForm.register('warranty')} /></Field>
                <Field label="Notes"><Textarea {...quoteForm.register('notes')} /></Field>
                <Field label="Attachments"><Input type="file" multiple accept=".pdf,.doc,.docx,image/*" {...quoteForm.register('attachments')} /></Field>
                <Field label="Timeline"><Textarea {...quoteForm.register('timeline')} /></Field>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => setQuoteTarget(null)}>Cancel</Button>
                  <Button>Submit</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </ContractorWorkspace>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
