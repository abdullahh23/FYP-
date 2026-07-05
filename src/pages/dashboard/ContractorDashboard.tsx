import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Field, Input, Textarea } from '../../components/ui/forms';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/toast';
import { getContractorProfile, listIncomingRequests, submitQuotation, upsertContractorProfile } from '../../services/contractors';
import { uploadToBucket } from '../../services/storage';
import { ChatPanel } from '../../components/chat/ChatPanel';
import { formatCurrency } from '../../lib/utils';

type ProfileForm = {
  experience_years: number;
  specialization: string;
  bio: string;
  completed_projects: number;
  min_budget: number;
  max_budget: number;
};

type QuoteForm = { amount: number; duration_days: number; notes: string; timeline: string };

export function ContractorDashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [chat, setChat] = useState<{ projectId: string; homeownerId: string; homeownerName: string; quotationId: string } | null>(null);
  const contractorProfile = useQuery({ queryKey: ['contractor-profile', user?.id], queryFn: () => getContractorProfile(user!.id), enabled: Boolean(user?.id) });
  const requests = useQuery({ queryKey: ['incoming-requests', user?.id], queryFn: () => listIncomingRequests(user!.id), enabled: Boolean(user?.id) });
  const form = useForm<ProfileForm>({
    values: {
      experience_years: contractorProfile.data?.experience_years ?? 0,
      specialization: contractorProfile.data?.specialization ?? 'Residential Construction',
      bio: contractorProfile.data?.bio ?? '',
      completed_projects: contractorProfile.data?.completed_projects ?? 0,
      min_budget: contractorProfile.data?.min_budget ?? 0,
      max_budget: contractorProfile.data?.max_budget ?? 0
    }
  });
  const quoteForm = useForm<QuoteForm>({ defaultValues: { amount: 0, duration_days: 120, notes: '', timeline: 'Mobilization, grey structure, services, finishing, handover.' } });

  const saveProfile = useMutation({
    mutationFn: async (values: ProfileForm) => upsertContractorProfile(user!.id, { ...values, portfolio_urls: contractorProfile.data?.portfolio_urls ?? [], average_rating: contractorProfile.data?.average_rating ?? 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-profile', user?.id] });
      toast({ title: 'Contractor profile saved', type: 'success' });
    },
    onError: (error) => toast({ title: 'Profile save failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' })
  });

  async function uploadPortfolio(file?: File) {
    if (!file || !user?.id) return;
    try {
      const url = await uploadToBucket('portfolio-images', user.id, file);
      await upsertContractorProfile(user.id, {
        ...(contractorProfile.data ?? { user_id: user.id, experience_years: 0, specialization: 'Residential Construction', completed_projects: 0, average_rating: 0 }),
        portfolio_urls: [...(contractorProfile.data?.portfolio_urls ?? []), url]
      });
      queryClient.invalidateQueries({ queryKey: ['contractor-profile', user.id] });
      toast({ title: 'Portfolio image uploaded', type: 'success' });
    } catch (error) {
      toast({ title: 'Upload failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    }
  }

  async function sendQuote(quotationId: string, values: QuoteForm) {
    try {
      await submitQuotation(quotationId, values);
      toast({ title: 'Quotation submitted', type: 'success' });
      requests.refetch();
    } catch (error) {
      toast({ title: 'Quotation failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold">Contractor Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Manage your profile, incoming requests, quotation submissions, notes, status, and chat.</p>
      </div>
      {!profile?.is_verified && <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/30"><CardContent className="pt-5 text-sm font-semibold text-amber-800 dark:text-amber-200">Your profile is saved but will not appear publicly until future admin verification.</CardContent></Card>}
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Contractor profile</CardTitle>
            <CardDescription>Portfolio uploads are stored in Supabase Storage.</CardDescription>
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
          <CardHeader>
            <CardTitle>Incoming requests</CardTitle>
            <CardDescription>Submit amount, timeline, notes, and status updates for homeowner comparison.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {requests.data?.length ? requests.data.map((request) => {
              const project = request.projects as { title?: string; city?: string; ai_estimate_json?: { total_estimate_min: number; total_estimate_max: number } } | null;
              const homeowner = request.homeowner as { id: string; name?: string | null } | null;
              return (
                <div key={request.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{project?.title ?? 'Project request'}</p>
                      <p className="text-sm text-muted-foreground">{project?.city ?? 'City not set'}</p>
                      {project?.ai_estimate_json && <p className="text-sm font-semibold text-primary">{formatCurrency(project.ai_estimate_json.total_estimate_min)} - {formatCurrency(project.ai_estimate_json.total_estimate_max)}</p>}
                    </div>
                    <Badge>{request.status}</Badge>
                  </div>
                  <form className="mt-4 grid gap-3" onSubmit={quoteForm.handleSubmit((values) => sendQuote(request.id, values))}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Quotation amount"><Input type="number" {...quoteForm.register('amount', { valueAsNumber: true })} /></Field>
                      <Field label="Duration days"><Input type="number" {...quoteForm.register('duration_days', { valueAsNumber: true })} /></Field>
                    </div>
                    <Field label="Timeline"><Input {...quoteForm.register('timeline')} /></Field>
                    <Field label="Notes"><Textarea {...quoteForm.register('notes')} /></Field>
                    <div className="flex gap-2">
                      <Button size="sm">Submit quotation</Button>
                      {homeowner?.id && <Button type="button" variant="secondary" size="sm" onClick={() => setChat({ projectId: request.project_id, homeownerId: homeowner.id, homeownerName: homeowner.name ?? 'Homeowner', quotationId: request.id })}>Chat</Button>}
                    </div>
                  </form>
                </div>
              );
            }) : <p className="rounded-xl border p-6 text-center text-muted-foreground">No incoming requests yet.</p>}
          </CardContent>
        </Card>
      </div>
      {chat && <ChatPanel projectId={chat.projectId} peerId={chat.homeownerId} quotationId={chat.quotationId} peerName={chat.homeownerName} />}
    </div>
  );
}
