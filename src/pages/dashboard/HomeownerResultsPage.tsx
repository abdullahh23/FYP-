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
  CircleDollarSign,
  Clock3,
  Home,
  MapPin,
  MessageSquare,
  PackageCheck,
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
  requestQuotation,
  listRecommendedProducts
} from '../../services/projects';
import type { ContractorMatch, Project, Quotation, RecommendedProduct } from '../../types';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/forms';
import { Badge } from '../../components/ui/card';
import { useToast } from '../../components/ui/toast';
import { formatCurrency } from '../../lib/utils';
import { projectProgressStages } from '../../lib/constants';
import { ChatPanel } from '../../components/chat/ChatPanel';
import { acceptMaterialQuote, listMaterialQuoteRequests, requestMaterialQuote } from '../../services/suppliers';

export function HomeownerResultsPage() {
  const { projectId } = useParams();
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeChat, setActiveChat] = useState<{ contractorId: string; name: string; quotationId?: string } | null>(null);
  const [supplierChat, setSupplierChat] = useState<{ supplierId: string; name: string } | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [requestNotes, setRequestNotes] = useState('');
  const project = useQuery({ queryKey: ['project', projectId], queryFn: () => getProject(projectId!), enabled: Boolean(projectId) });
  const contractors = useQuery({ queryKey: ['contractors', projectId], queryFn: () => listContractorMatches(projectId!), enabled: Boolean(projectId) });
  const quotations = useQuery({ queryKey: ['quotations', projectId], queryFn: () => listProjectQuotations(projectId!), enabled: Boolean(projectId) });
  const promotions = useQuery({ queryKey: ['promotions', projectId], queryFn: () => listRelevantPromotions(projectId!), enabled: Boolean(projectId) });
  const recommendedProducts = useQuery({ queryKey: ['recommended-products', projectId], queryFn: () => listRecommendedProducts(projectId!), enabled: Boolean(projectId) });
  const materialQuotes = useQuery({ queryKey: ['homeowner-material-quotes', user?.id], queryFn: () => listMaterialQuoteRequests(user!.id, 'homeowner'), enabled: Boolean(user?.id) });

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
      await requestQuotation(project.data!, contractor.user_id, requestNotes);
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

  async function requestSelectedMaterials() {
    if (!user?.id || !projectId || !selectedProducts.length) return;
    const selected = recommendedProducts.data?.filter((item) => selectedProducts.includes(item.product.id)) ?? [];
    const suppliers = new Map<string, RecommendedProduct[]>();
    selected.forEach((item) => suppliers.set(item.product.supplier_id, [...(suppliers.get(item.product.supplier_id) ?? []), item]));
    try {
      await Promise.all(Array.from(suppliers.entries()).map(([supplierId, items]) => requestMaterialQuote({ projectId, homeownerId: user.id, supplierId, products: items.map((item) => ({ productId: item.product.id, quantity: 1 })) })));
      setSelectedProducts([]);
      toast({ title: 'Material quote requested', description: `${suppliers.size} supplier${suppliers.size === 1 ? '' : 's'} received your request.`, type: 'success' });
    } catch (error) {
      toast({ title: 'Material request failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    }
  }

  async function chooseMaterialQuote(requestId: string) {
    try { await acceptMaterialQuote(requestId); await materialQuotes.refetch(); toast({ title: 'Supplier quotation accepted', type: 'success' }); }
    catch (error) { toast({ title: 'Could not accept supplier quote', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' }); }
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
          <SectionHeading eyebrow="Best fit first" title="Recommended contractors" description="Ranked by budget fit, city, experience, completed projects, rating, specialization, and material preference." />
          <Textarea className="mt-5 min-h-20" value={requestNotes} onChange={(event) => setRequestNotes(event.target.value)} placeholder="Optional notes included with every quote request" />
          <div className="mt-6 grid gap-3">
            {contractors.data?.length ? contractors.data.map((contractor) => (
              <ContractorRow key={contractor.user_id} contractor={contractor} onRequest={() => sendQuotationRequest(contractor)} />
            )) : <InlineEmpty>No completed contractor profiles match this project yet.</InlineEmpty>}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-panel sm:p-6">
          <SectionHeading eyebrow="Matched to your build" title="Supplier offers" description="Relevant promotions selected from your project tags." />
          <div className="mt-6 grid gap-3">
            {materialQuotes.data?.filter((quote) => quote.project_id === projectId).map((quote) => <div key={quote.id} className="rounded-lg border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold">{quote.supplier?.company_name ?? 'Supplier quotation'}</p><p className="text-xs text-muted-foreground">{quote.delivery_time ?? 'Delivery pending'}</p></div><Badge tone={quote.status === 'accepted' ? 'success' : 'neutral'}>{quote.status}</Badge></div>{quote.total_price != null && <p className="mt-3 text-xl font-bold text-primary">{formatCurrency(quote.total_price)}</p>}<p className="mt-1 text-sm text-muted-foreground">Discount {quote.discount}% · {quote.notes}</p>{quote.status === 'negotiating' && <Button className="mt-3" size="sm" onClick={() => chooseMaterialQuote(quote.id)}>Accept offer</Button>}</div>)}
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
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Smart marketplace" title="Recommended products" description="Matched to your material grade, construction scope, and selected project features." />
          {selectedProducts.length > 0 && <Button onClick={requestSelectedMaterials}><PackageCheck className="h-4 w-4" /> Request material quote ({selectedProducts.length})</Button>}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {recommendedProducts.data?.length ? recommendedProducts.data.map((item) => {
            const finalPrice = item.product.price * (1 - item.product.discount / 100);
            const selected = selectedProducts.includes(item.product.id);
            return <div key={item.product.id} className={`rounded-lg border p-4 ${selected ? 'border-primary bg-primary/[0.04]' : ''}`}>
              {item.product.image_urls[0] && <img src={item.product.image_urls[0]} alt={item.product.name} className="mb-4 aspect-[16/10] w-full rounded-lg object-cover" />}
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-primary">{item.product.brand}</p><Link to={`/marketplace/products/${item.product.id}`} className="font-bold hover:text-primary">{item.product.name}</Link></div>{item.product.discount > 0 && <Badge tone="success">-{item.product.discount}%</Badge>}</div>
              <p className="mt-2 text-lg font-bold">{formatCurrency(finalPrice)} <span className="text-xs font-normal text-muted-foreground">/{item.product.unit}</span></p>
              <p className="mt-1 text-xs text-muted-foreground">{item.supplier.company_name} · {item.product.delivery_time ?? 'Delivery on request'}</p>
              <div className="mt-4 flex gap-2"><Button size="sm" variant={selected ? 'primary' : 'secondary'} onClick={() => setSelectedProducts((current) => selected ? current.filter((id) => id !== item.product.id) : [...current, item.product.id])}>{selected ? 'Selected' : 'Compare & quote'}</Button><Button size="sm" variant="ghost" onClick={() => setSupplierChat({ supplierId: item.product.supplier_id, name: item.supplier.company_name })}><MessageSquare className="h-4 w-4" /> Chat</Button></div>
            </div>;
          }) : <div className="sm:col-span-2 xl:col-span-3"><InlineEmpty>No products match this project yet. Recommendations appear as suppliers publish tagged products.</InlineEmpty></div>}
        </div>
        {selectedProducts.length > 1 && <ProductComparison items={(recommendedProducts.data ?? []).filter((item) => selectedProducts.includes(item.product.id))} />}
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
      {supplierChat && <ChatPanel projectId={currentProject.id} peerId={supplierChat.supplierId} peerName={supplierChat.name} />}
    </div>
  );
}

function EstimateAnalytics({ project }: { project: Project }) {
  const estimate = project.ai_estimate_json!;
  const costs = [
    { label: 'Land preparation', value: estimate.land_preparation_cost, color: 'bg-cyan-500' },
    { label: 'Foundation', value: estimate.foundation_cost ?? 0, color: 'bg-teal-500' },
    { label: 'Structure', value: estimate.structure_cost, color: 'bg-primary' },
    { label: 'Roofing', value: estimate.roofing_cost ?? 0, color: 'bg-indigo-500' },
    { label: 'Electrical', value: estimate.electrical_cost, color: 'bg-amber-500' },
    { label: 'Plumbing', value: estimate.plumbing_cost, color: 'bg-blue-500' },
    { label: 'Paint', value: estimate.paint_cost ?? 0, color: 'bg-rose-500' },
    { label: 'Tiles', value: estimate.tiles_cost ?? 0, color: 'bg-orange-500' },
    { label: 'Doors & Windows', value: estimate.doors_windows_cost ?? 0, color: 'bg-violet-500' },
    { label: 'Finishing', value: estimate.finishing_cost, color: 'bg-emerald-500' },
    { label: 'Labour cost', value: estimate.labour_cost ?? 0, color: 'bg-purple-500' },
    { label: 'Material cost', value: estimate.material_cost ?? 0, color: 'bg-sky-500' },
    { label: 'Miscellaneous', value: estimate.miscellaneous_cost ?? 0, color: 'bg-slate-500' },
  ].filter(cost => cost.value > 0);

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
          {estimate.pricing_basis && (
            <p className="mt-4 border-t pt-3 text-xs italic text-muted-foreground">{estimate.pricing_basis}</p>
          )}
        </div>
        {estimate.timeline && (
          <div className="rounded-lg border bg-card p-5 shadow-panel sm:p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Estimated Timeline</p>
            <p className="mt-3 text-lg font-bold">{estimate.timeline}</p>
            {estimate.confidence !== undefined && (
              <p className="mt-2 text-xs text-muted-foreground">AI Estimation Confidence: {estimate.confidence}%</p>
            )}
          </div>
        )}
        {estimate.risk_factors && estimate.risk_factors.length > 0 && (
          <div className="rounded-lg border bg-card p-5 shadow-panel sm:p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Risk Factors Identified</p>
            <ul className="mt-3 list-disc pl-5 text-sm space-y-2 text-muted-foreground">
              {estimate.risk_factors.map((risk, i) => <li key={i}>{risk}</li>)}
            </ul>
          </div>
        )}
        {estimate.suggestions && estimate.suggestions.length > 0 && (
          <div className="rounded-lg border bg-card p-5 shadow-panel sm:p-6">
            <p className="flex items-center gap-2 text-sm font-bold text-primary">Suggestions & Tips</p>
            <ul className="mt-3 list-disc pl-5 text-sm space-y-2 text-muted-foreground">
              {estimate.suggestions.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-panel lg:col-span-2 sm:p-6">
        <p className="mb-5 text-sm font-bold">Project journey</p>
        <div className="grid gap-3 sm:grid-cols-4">
          {projectProgressStages.map((status, index) => {
            const activeIndex = projectProgressStages.indexOf(project.progress_stage ?? 'Planning');
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
          <div><p className="font-bold">{contractor.name}</p><p className="mt-1 text-sm text-muted-foreground">{contractor.specialization} · {contractor.city ?? 'Flexible location'}</p></div>
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
      <div className="mt-5 flex gap-2">{quote.status === 'negotiating' && <Button size="sm" onClick={onAccept}><Check className="h-4 w-4" /> Accept</Button>}<Button size="sm" variant="secondary" onClick={onChat}><MessageSquare className="h-4 w-4" /> Chat</Button></div>
    </div>
  );
}

function ProductComparison({ items }: { items: RecommendedProduct[] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-muted/60 text-xs uppercase text-muted-foreground"><tr><th className="p-3">Product / Supplier</th><th className="p-3">Price</th><th className="p-3">Discount</th><th className="p-3">Delivery</th><th className="p-3">Rating</th><th className="p-3">Warranty</th></tr></thead>
        <tbody>{items.map((item) => <tr key={item.product.id} className="border-t"><td className="p-3 font-semibold">{item.product.name}<span className="block text-xs font-normal text-muted-foreground">{item.supplier.company_name}</span></td><td className="p-3">{formatCurrency(item.product.price * (1 - item.product.discount / 100))}</td><td className="p-3">{item.product.discount}%</td><td className="p-3">{item.product.delivery_time ?? 'On request'}</td><td className="p-3">{item.supplier.average_rating.toFixed(1)}</td><td className="p-3">{item.product.warranty ?? 'Not listed'}</td></tr>)}</tbody>
      </table>
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
