import { useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Home,
  MapPin,
  MessageSquare,
  RefreshCw,
  Ruler,
  Send,
  Sparkles,
  Star,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  acceptQuotation,
  getProject,
  listContractorMatches,
  listProjectQuotations,
  listRelevantPromotions,
  requestEstimate,
  requestQuotation
} from '../../services/projects';
import type { ContractorMatch, Project, Quotation } from '../../types';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/card';
import { useToast } from '../../components/ui/toast';
import { formatCurrency } from '../../lib/utils';
import { projectStatuses } from '../../lib/constants';
import { ChatPanel } from '../../components/chat/ChatPanel';

export function HomeownerResultsPage() {
  const { projectId } = useParams();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeChat, setActiveChat] = useState<{ contractorId: string; name: string; quotationId?: string } | null>(null);
  const project = useQuery({ queryKey: ['project', projectId], queryFn: () => getProject(projectId!), enabled: Boolean(projectId) });
  const contractors = useQuery({ queryKey: ['contractors', projectId], queryFn: () => listContractorMatches(projectId!), enabled: Boolean(projectId) });
  const quotations = useQuery({ queryKey: ['quotations', projectId], queryFn: () => listProjectQuotations(projectId!), enabled: Boolean(projectId) });
  const promotions = useQuery({ queryKey: ['promotions', projectId], queryFn: () => listRelevantPromotions(projectId!), enabled: Boolean(projectId) });

  const retryMutation = useMutation({
    mutationFn: () => requestEstimate(projectId!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast({ title: 'Estimate refreshed', type: 'success' });
    },
    onError: (error) => toast({ title: 'AI estimation failed', description: error instanceof Error ? error.message : 'Please try again later.', type: 'error' })
  });

  if (profile?.role && profile.role !== 'homeowner') return <Navigate to="/dashboard" replace />;
  if (project.isLoading) return <ResultsSkeleton />;
  if (!project.data || project.isError) {
    return (
      <EmptyState title="We could not open this project" description="The project may no longer be available or you may not have access to it." />
    );
  }

  async function sendQuotationRequest(contractor: ContractorMatch) {
    try {
      await requestQuotation(project.data!, contractor.user_id);
      toast({ title: 'Quotation requested', description: `${contractor.name} can now respond.`, type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['quotations', projectId] });
    } catch (error) {
      toast({ title: 'Request failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    }
  }

  async function chooseQuotation(quotation: Quotation) {
    try {
      await acceptQuotation(quotation);
      toast({ title: 'Quotation accepted', description: 'Other quotations were rejected automatically.', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['quotations', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    } catch (error) {
      toast({ title: 'Could not accept quotation', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    }
  }

  const currentProject = project.data;
  const estimate = currentProject.ai_estimate_json;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/dashboard" className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> New estimate
        </Link>
        <div className="flex items-center gap-2">
          <Badge tone={estimate ? 'success' : currentProject.ai_error ? 'warning' : 'neutral'}>{estimate ? 'AI estimate ready' : currentProject.ai_error ? 'Retry available' : 'Estimate pending'}</Badge>
          <Button variant="secondary" size="sm" loading={retryMutation.isPending} onClick={() => retryMutation.mutate()}>
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border bg-card shadow-panel">
        <div className="border-b bg-primary/[0.06] px-5 py-7 sm:px-8 sm:py-9">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Project estimate</p>
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{currentProject.title}</h1>
              <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {currentProject.city} · {currentProject.construction_type}</p>
            </div>
            {estimate && (
              <div className="min-w-[280px] rounded-lg bg-primary p-5 text-primary-foreground">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Estimated investment</p>
                <p className="mt-2 text-2xl font-bold sm:text-3xl">{formatCurrency(estimate.total_estimate_min)}</p>
                <p className="mt-1 text-sm opacity-80">to {formatCurrency(estimate.total_estimate_max)}</p>
              </div>
            )}
          </div>
        </div>
        <div className="grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          <Metric icon={Ruler} label="Covered area" value={`${currentProject.covered_area.toLocaleString()} sq ft`} />
          <Metric icon={Building2} label="Plot size" value={`${currentProject.plot_size} marla`} />
          <Metric icon={Home} label="Floors" value={String(currentProject.floors)} />
          <Metric icon={Sparkles} label="Material quality" value={currentProject.material_quality} />
        </div>
      </section>

      {estimate ? <EstimateAnalytics project={currentProject} /> : <EstimateUnavailable project={currentProject} onRetry={() => retryMutation.mutate()} loading={retryMutation.isPending} />}

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-lg border bg-card p-5 shadow-panel sm:p-6">
          <SectionHeading eyebrow="Best fit first" title="Recommended contractors" description="Ranked by city, verification, experience, ratings, completed projects, specialization, and budget fit." />
          <div className="mt-6 grid gap-3">
            {contractors.data?.length ? contractors.data.map((contractor) => (
              <ContractorRow key={contractor.user_id} contractor={contractor} onRequest={() => sendQuotationRequest(contractor)} />
            )) : <InlineEmpty>No verified contractors match this project yet.</InlineEmpty>}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-panel sm:p-6">
          <SectionHeading eyebrow="Matched to your build" title="Supplier offers" description="Relevant promotions selected from your project tags." />
          <div className="mt-6 grid gap-3">
            {promotions.data?.length ? promotions.data.map((promotion) => (
              <div key={promotion.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3"><p className="font-bold">{promotion.title}</p><ArrowUpRight className="h-4 w-4 text-primary" /></div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{promotion.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">{promotion.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
              </div>
            )) : <InlineEmpty>No matching supplier promotions yet.</InlineEmpty>}
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-panel sm:p-6">
        <SectionHeading eyebrow="Compare with confidence" title="Quotations" description="Review contractor offers side by side. Accepting one automatically rejects the others." />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {quotations.data?.length ? quotations.data.map((quote) => (
            <QuotationCard key={quote.id} quote={quote} onAccept={() => chooseQuotation(quote)} onChat={() => setActiveChat({ contractorId: quote.contractor_id, name: quote.contractor?.name ?? 'Contractor', quotationId: quote.id })} />
          )) : <div className="lg:col-span-2"><InlineEmpty>Request quotations from recommended contractors to compare offers here.</InlineEmpty></div>}
        </div>
      </section>

      {activeChat && <ChatPanel projectId={currentProject.id} peerId={activeChat.contractorId} quotationId={activeChat.quotationId} peerName={activeChat.name} />}
    </div>
  );
}

function EstimateAnalytics({ project }: { project: Project }) {
  const estimate = project.ai_estimate_json!;
  const costs = [
    { label: 'Land preparation', value: estimate.land_preparation_cost, color: 'bg-cyan-500' },
    { label: 'Structure', value: estimate.structure_cost, color: 'bg-primary' },
    { label: 'Electrical', value: estimate.electrical_cost, color: 'bg-amber-500' },
    { label: 'Plumbing', value: estimate.plumbing_cost, color: 'bg-blue-500' },
    { label: 'Finishing', value: estimate.finishing_cost, color: 'bg-emerald-500' }
  ];
  const max = Math.max(...costs.map((cost) => cost.value));
  const midpoint = (estimate.total_estimate_min + estimate.total_estimate_max) / 2;
  const spread = estimate.total_estimate_max - estimate.total_estimate_min;

  return (
    <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      <div className="rounded-lg border bg-card p-5 shadow-panel sm:p-6">
        <SectionHeading eyebrow="Cost composition" title="Where your budget goes" description="A category-by-category view of the AI estimate." />
        <div className="mt-7 grid gap-5">
          {costs.map((cost) => (
            <div key={cost.label}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm"><span className="font-semibold">{cost.label}</span><span className="text-muted-foreground">{formatCurrency(cost.value)}</span></div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${cost.color}`} style={{ width: `${Math.max(5, (cost.value / max) * 100)}%` }} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border bg-card p-5 shadow-panel sm:p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Estimate range</p>
          <div className="mt-5 flex items-end justify-between gap-3"><p className="text-sm text-muted-foreground">Midpoint</p><p className="text-xl font-bold">{formatCurrency(midpoint)}</p></div>
          <div className="relative mt-6 h-3 rounded-full bg-muted"><div className="absolute inset-y-0 left-[10%] right-[10%] rounded-full bg-primary/30" /><div className="absolute left-1/2 top-1/2 h-5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" /></div>
          <div className="mt-3 flex justify-between text-xs font-semibold text-muted-foreground"><span>{formatCurrency(estimate.total_estimate_min)}</span><span>{formatCurrency(estimate.total_estimate_max)}</span></div>
          <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"><TrendingUp className="h-4 w-4 text-primary" /> Range spread: {formatCurrency(spread)}</p>
        </div>
        <div className="rounded-lg border bg-card p-5 shadow-panel sm:p-6">
          <p className="flex items-center gap-2 text-sm font-bold"><Bot className="h-4 w-4 text-primary" /> AI summary</p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{estimate.explanation}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-panel lg:col-span-2 sm:p-6">
        <p className="mb-5 text-sm font-bold">Project journey</p>
        <div className="grid gap-3 sm:grid-cols-4">
          {projectStatuses.map((status, index) => {
            const activeIndex = projectStatuses.indexOf(project.status);
            const complete = index <= activeIndex;
            return (
              <div key={status} className={`flex items-center gap-3 rounded-lg border p-3 text-sm font-semibold ${complete ? 'border-primary/30 bg-primary/[0.06] text-primary' : 'text-muted-foreground'}`}>
                <span className={`grid h-7 w-7 place-items-center rounded-full ${complete ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{complete ? <Check className="h-3.5 w-3.5" /> : index + 1}</span>{status}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ContractorRow({ contractor, onRequest }: { contractor: ContractorMatch; onRequest: () => void }) {
  return (
    <div className="rounded-lg border p-4 transition-shadow hover:shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 font-bold text-primary">{contractor.name.slice(0, 2).toUpperCase()}</span>
          <div><div className="flex flex-wrap items-center gap-2"><p className="font-bold">{contractor.name}</p><Badge tone="success"><CheckCircle2 className="mr-1 h-3 w-3" /> Verified</Badge></div><p className="mt-1 text-sm text-muted-foreground">{contractor.specialization} · {contractor.city ?? 'Flexible location'}</p></div>
        </div>
        <Button size="sm" onClick={onRequest}><Send className="h-4 w-4" /> Request quote</Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t pt-3 text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-500" /> {contractor.average_rating.toFixed(1)}</span>
        <span>{contractor.experience_years} years experience</span><span>{contractor.completed_projects} projects</span><span className="text-primary">{Math.round(contractor.match_score)}% match</span>
      </div>
    </div>
  );
}

function QuotationCard({ quote, onAccept, onChat }: { quote: Quotation; onAccept: () => void; onChat: () => void }) {
  return (
    <div className="rounded-lg border p-5">
      <div className="flex items-start justify-between gap-3"><div><p className="font-bold">{quote.contractor?.name ?? 'Contractor'}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {quote.contractor?.city ?? 'City not set'}</p></div><Badge tone={quote.status === 'accepted' ? 'success' : quote.status === 'rejected' ? 'danger' : 'neutral'}>{quote.status}</Badge></div>
      <p className="mt-5 text-2xl font-bold text-primary">{quote.amount ? formatCurrency(quote.amount) : 'Awaiting quote'}</p>
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">{quote.duration_days && <span className="flex items-center gap-1"><Clock3 className="h-4 w-4" /> {quote.duration_days} days</span>}{quote.timeline && <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" /> {quote.timeline}</span>}</div>
      {quote.notes && <p className="mt-4 border-t pt-4 text-sm leading-6 text-muted-foreground">{quote.notes}</p>}
      <div className="mt-5 flex gap-2">{quote.status === 'submitted' && <Button size="sm" onClick={onAccept}><Check className="h-4 w-4" /> Accept</Button>}<Button size="sm" variant="secondary" onClick={onChat}><MessageSquare className="h-4 w-4" /> Chat</Button></div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Ruler; label: string; value: string }) {
  return <div className="flex items-center gap-3 px-5 py-5 sm:px-6"><span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span><div><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="mt-1 font-bold">{value}</p></div></div>;
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div><p className="text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</p><h2 className="mt-2 text-xl font-bold sm:text-2xl">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p></div>;
}

function EstimateUnavailable({ project, onRetry, loading }: { project: Project; onRetry: () => void; loading: boolean }) {
  return <div className="rounded-lg border bg-card p-8 text-center shadow-panel"><span className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"><CircleDollarSign className="h-5 w-5" /></span><h2 className="mt-4 text-xl font-bold">Your project is safely saved</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{project.ai_error ?? 'The estimate is still being prepared. You can retry at any time.'}</p><Button className="mt-5" loading={loading} onClick={onRetry}><RefreshCw className="h-4 w-4" /> Retry AI estimate</Button></div>;
}

function InlineEmpty({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">{children}</p>;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="mx-auto max-w-xl rounded-lg border bg-card p-10 text-center shadow-panel"><h1 className="text-2xl font-bold">{title}</h1><p className="mt-3 text-muted-foreground">{description}</p><Link to="/dashboard" className="focus-ring mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-panel hover:bg-primary/90">Back to dashboard</Link></div>;
}

function ResultsSkeleton() {
  return <div className="animate-pulse space-y-6"><div className="h-8 w-40 rounded bg-muted" /><div className="h-72 rounded-lg bg-muted" /><div className="grid gap-6 lg:grid-cols-2"><div className="h-96 rounded-lg bg-muted" /><div className="h-96 rounded-lg bg-muted" /></div></div>;
}
