import { useState, type ReactNode, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
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
import { useLanguage } from '../../contexts/LanguageContext';
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
import { getConversation, sendMessage } from '../../services/chat';

export function HomeownerResultsPage() {
  const { projectId } = useParams();
  const { profile, user } = useAuth();
  const { tx, isUrdu } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
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

  useEffect(() => {
    const chatContractorId = searchParams.get('chatContractorId');
    const chatSupplierId = searchParams.get('chatSupplierId');
    const qId = searchParams.get('quotationId');
    const name = searchParams.get('name');
    if (chatContractorId) {
      setActiveChat({ contractorId: chatContractorId, name: name ?? 'Contractor', quotationId: qId ?? undefined });
      setTimeout(() => document.getElementById('homeowner-chat')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    } else if (chatSupplierId) {
      setSupplierChat({ supplierId: chatSupplierId, name: name ?? 'Supplier' });
      setTimeout(() => document.getElementById('homeowner-chat')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  }, [searchParams]);

  const retryMutation = useMutation({
    mutationFn: () => requestEstimate(projectId!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast({ title: isUrdu ? 'تخمینہ تازہ کر دیا گیا ہے' : 'Estimate refreshed', type: 'success' });
    },
    onError: (error) => toast({ title: 'AI estimation failed', description: error instanceof Error ? error.message : 'Please try again later.', type: 'error' })
  });

  if (profile?.role && profile.role !== 'homeowner') return <Navigate to="/dashboard" replace />;
  if (project.isLoading) return <ResultsSkeleton />;
  if (!project.data || project.isError) {
    return (
      <EmptyState
        title={isUrdu ? 'پروجیکٹ نہیں کھل سکا' : 'We could not open this project'}
        description={isUrdu ? 'شاید یہ پروجیکٹ اب دستیاب نہیں ہے یا آپ کے پاس رسائی نہیں ہے۔' : 'The project may no longer be available or you may not have access to it.'}
        btnText={tx.nav.dashboard}
      />
    );
  }

  async function sendQuotationRequest(contractor: ContractorMatch) {
    try {
      const quotation = await requestQuotation(project.data!, contractor.user_id, requestNotes);
      const conversation = await getConversation(project.data!.id, contractor.user_id, user!.id, quotation.id);
      await sendMessage({
        project_id: project.data!.id,
        quotation_id: quotation.id,
        conversation_id: conversation.id,
        sender_id: user!.id,
        receiver_id: contractor.user_id,
        message_type: 'text',
        body: isUrdu
          ? `السلام علیکم! میں نے اپنے پروجیکٹ "${project.data!.title}" کے لیے کوٹیشن طلب کی ہے۔ برائے مہربانی ریٹس اور تفصیلات شیئر کریں۔`
          : `Hello! I have requested a quote for my project: "${project.data!.title}". Let's discuss details and pricing here.`,
        image_url: null,
        file_url: null,
        file_name: null,
        mime_type: null
      });

      toast({
        title: isUrdu ? 'کوٹیشن کی درخواست بھیج دی گئی ہے' : 'Quotation requested',
        description: `${contractor.name} ${isUrdu ? 'کو آپ کی درخواست موصول ہو گئی ہے۔' : 'can now respond.'}`,
        type: 'success'
      });
      queryClient.invalidateQueries({ queryKey: ['quotations', projectId] });
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    } catch (error) {
      toast({ title: 'Request failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    }
  }

  async function chooseQuotation(quotation: Quotation) {
    try {
      await acceptQuotation(quotation);
      toast({
        title: isUrdu ? 'کوٹیشن منظور کر لی گئی ہے' : 'Quotation accepted',
        description: isUrdu ? 'دیگر تمام کوٹیشنز خودکار طور پر بند ہو گئیں۔' : 'Other quotations were rejected automatically.',
        type: 'success'
      });
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
      toast({
        title: isUrdu ? 'میٹریل کی قیمت معلوم کرنے کی درخواست بھیج دی گئی' : 'Material quote requested',
        description: `${suppliers.size} ${isUrdu ? 'سپلائرز کو اطلاع بھیج دی گئی ہے۔' : 'suppliers received your request.'}`,
        type: 'success'
      });
    } catch (error) {
      toast({ title: 'Material request failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    }
  }

  async function chooseMaterialQuote(requestId: string) {
    try {
      await acceptMaterialQuote(requestId);
      await materialQuotes.refetch();
      toast({ title: isUrdu ? 'سپلائر کی پیشکش منظور ہو گئی' : 'Supplier quotation accepted', type: 'success' });
    } catch (error) {
      toast({ title: 'Could not accept supplier quote', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    }
  }

  const currentProject = project.data;
  const estimate = currentProject.ai_estimate_json;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/dashboard" className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className={isUrdu ? 'h-4 w-4 rotate-180' : 'h-4 w-4'} />
          {isUrdu ? 'نیا تخمینہ یا ڈیش بورڈ' : 'New estimate'}
        </Link>
        <div className="flex items-center gap-2">
          <Badge tone={estimate ? 'success' : currentProject.ai_error ? 'warning' : 'neutral'}>
            {estimate
              ? (isUrdu ? 'تخمینہ تیار ہے' : 'AI estimate ready')
              : currentProject.ai_error
              ? (isUrdu ? 'دوبارہ کوشش دستیاب ہے' : 'Retry available')
              : (isUrdu ? 'تخمینہ زیر تیاری' : 'Estimate pending')}
          </Badge>
          <Button variant="secondary" size="sm" loading={retryMutation.isPending} onClick={() => retryMutation.mutate()}>
            <RefreshCw className="h-4 w-4" /> {isUrdu ? 'دوبارہ تخمینہ لگائیں' : 'Retry'}
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border bg-card shadow-panel">
        <div className="border-b bg-emerald-500/[0.06] px-5 py-7 sm:px-8 sm:py-9">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                {isUrdu ? 'پروجیکٹ کی لاگت کا تخمینہ' : 'Project estimate'}
              </p>
              <h1 className="mt-3 text-2xl sm:text-4xl font-bold">{currentProject.title}</h1>
              <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-emerald-600" /> {currentProject.city} · {currentProject.construction_type}
              </p>
            </div>
            {estimate && (
              <div className="min-w-[280px] rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white shadow-md">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-90">{tx.estimator.totalEstimatedCost}</p>
                <p className="mt-2 text-2xl font-black sm:text-3xl">{formatCurrency(estimate.total_estimate_min)}</p>
                <p className="mt-1 text-sm opacity-90">{isUrdu ? 'تا' : 'to'} {formatCurrency(estimate.total_estimate_max)}</p>
              </div>
            )}
          </div>
        </div>
        <div className="grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          <Metric icon={Ruler} label={isUrdu ? 'کورڈ ایریا' : 'Covered area'} value={`${currentProject.covered_area.toLocaleString()} ${tx.sqft}`} />
          <Metric icon={Building2} label={isUrdu ? 'پلاٹ کا سائز' : 'Plot size'} value={`${currentProject.plot_size} ${tx.marla}`} />
          <Metric icon={Home} label={isUrdu ? 'منزلیں' : 'Floors'} value={`${currentProject.floors} ${isUrdu ? 'منزل' : 'floors'}`} />
          <Metric icon={Sparkles} label={isUrdu ? 'میٹریل کوالٹی' : 'Material quality'} value={currentProject.material_quality} />
        </div>
        {currentProject.tags && currentProject.tags.length > 0 && (
          <div className="border-t bg-muted/20 px-5 py-3 sm:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground mr-1">
                {isUrdu ? 'پروجیکٹ کے مخصوص فیچرز:' : 'Project Layout & Features:'}
              </span>
              {currentProject.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center rounded-md bg-card px-2.5 py-1 text-xs font-medium border shadow-2xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {estimate ? (
        <EstimateAnalytics project={currentProject} isUrdu={isUrdu} tx={tx} />
      ) : (
        <EstimateUnavailable
          project={currentProject}
          onRetry={() => retryMutation.mutate()}
          loading={retryMutation.isPending}
          isUrdu={isUrdu}
        />
      )}

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border bg-card p-5 shadow-panel sm:p-6">
          <SectionHeading
            eyebrow={isUrdu ? 'بہترین انتخاب' : 'Best fit first'}
            title={tx.estimator.matchedContractors}
            description={isUrdu
              ? 'بجٹ، تجربہ، مکمل شدہ منصوبوں اور ریٹنگز کے مطابق درجہ بندی کی گئی ہے۔'
              : 'Ranked by budget fit, city, experience, completed projects, rating, specialization, and material preference.'}
          />
          <Textarea
            className="mt-5 min-h-20"
            value={requestNotes}
            onChange={(event) => setRequestNotes(event.target.value)}
            placeholder={isUrdu ? 'کوٹیشن درخواست کے ساتھ اضافی ہدایات لکھیں (اختیاری)' : 'Optional notes included with every quote request'}
          />
          <div className="mt-6 grid gap-3">
            {contractors.data?.length ? (
              contractors.data.map((contractor) => (
                <ContractorRow
                  key={contractor.user_id}
                  contractor={contractor}
                  onRequest={() => sendQuotationRequest(contractor)}
                  isUrdu={isUrdu}
                />
              ))
            ) : (
              <InlineEmpty>
                {isUrdu ? 'اس وقت کوئی ٹھیکیدار دستیاب نہیں ہے۔' : 'No completed contractor profiles match this project yet.'}
              </InlineEmpty>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-panel sm:p-6">
          <SectionHeading
            eyebrow={isUrdu ? 'تعمیراتی میٹریل' : 'Matched to your build'}
            title={tx.estimator.relevantMaterials}
            description={isUrdu ? 'آپ کے پروجیکٹ کے مطابق مصدقہ میٹریل سپلائرز کی ڈسکاؤنٹ آفرز۔' : 'Relevant promotions selected from your project tags.'}
          />
          <div className="mt-6 grid gap-3">
            {materialQuotes.data?.filter((quote) => quote.project_id === projectId).map((quote) => (
              <div key={quote.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{quote.supplier?.company_name ?? 'Supplier quotation'}</p>
                    <p className="text-xs text-muted-foreground">{quote.delivery_time ?? 'Delivery pending'}</p>
                  </div>
                  <Badge tone={quote.status === 'accepted' ? 'success' : 'neutral'}>{quote.status}</Badge>
                </div>
                {quote.total_price != null && (
                  <p className="mt-3 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(quote.total_price)}
                  </p>
                )}
                <p className="mt-1 text-sm text-muted-foreground">
                  {isUrdu ? `رعایت ${quote.discount}%` : `Discount ${quote.discount}%`} · {quote.notes}
                </p>
                {quote.status === 'negotiating' && (
                  <Button className="mt-3" size="sm" onClick={() => chooseMaterialQuote(quote.id)}>
                    {isUrdu ? 'پیشکش قبول کریں' : 'Accept offer'}
                  </Button>
                )}
              </div>
            ))}
            {promotions.data?.length ? (
              promotions.data.map((promotion) => (
                <div key={promotion.id} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold">{promotion.title}</p>
                    <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{promotion.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {promotion.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
                  </div>
                </div>
              ))
            ) : (
              <InlineEmpty>
                {isUrdu ? 'فی الحال کوئی اضافی آفر نہیں ہے۔' : 'No matching supplier promotions yet.'}
              </InlineEmpty>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-panel sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow={isUrdu ? 'مارکیٹ پلیس' : 'Smart marketplace'}
            title={isUrdu ? 'تجویز کردہ تعمیراتی میٹریل' : 'Recommended products'}
            description={isUrdu
              ? 'سیمنٹ، سریہ، اینٹ، ٹائلز اور سینیٹری کا سامان بہترین ریٹس پر۔'
              : 'Matched to your material grade, construction scope, and selected project features.'}
          />
          {selectedProducts.length > 0 && (
            <Button onClick={requestSelectedMaterials} className="gap-2 font-semibold">
              <PackageCheck className="h-4 w-4" />
              {isUrdu
                ? `منتخب شدہ کی کوٹیشن لیں (${selectedProducts.length})`
                : `Request material quote (${selectedProducts.length})`}
            </Button>
          )}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {recommendedProducts.data?.length ? (
            recommendedProducts.data.map((item) => {
              const finalPrice = item.product.price * (1 - item.product.discount / 100);
              const selected = selectedProducts.includes(item.product.id);
              return (
                <div key={item.product.id} className={`rounded-xl border p-4 transition-all ${selected ? 'border-emerald-600 bg-emerald-50/10' : ''}`}>
                  {item.product.image_urls[0] && (
                    <img src={item.product.image_urls[0]} alt={item.product.name} className="mb-4 aspect-[16/10] w-full rounded-lg object-cover" />
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{item.product.brand}</p>
                      <Link to={`/marketplace/products/${item.product.id}`} className="font-bold hover:text-primary">
                        {item.product.name}
                      </Link>
                    </div>
                    {item.product.discount > 0 && <Badge tone="success">-{item.product.discount}%</Badge>}
                  </div>
                  <p className="mt-2 text-lg font-bold">
                    {formatCurrency(finalPrice)}{' '}
                    <span className="text-xs font-normal text-muted-foreground">/{item.product.unit}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <Link to={`/suppliers/${item.product.supplier_id}`} className="font-semibold hover:text-primary hover:underline">
                      {item.supplier.company_name}
                    </Link>{' '}
                    · {item.product.delivery_time ?? (isUrdu ? 'ڈلیوری دستیاب ہے' : 'Delivery on request')}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant={selected ? 'primary' : 'secondary'}
                      onClick={() => setSelectedProducts((current) => selected ? current.filter((id) => id !== item.product.id) : [...current, item.product.id])}
                    >
                      {selected ? (isUrdu ? 'منتخب شدہ' : 'Selected') : (isUrdu ? 'موازنہ اور کوٹیشن' : 'Compare & quote')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSupplierChat({ supplierId: item.product.supplier_id, name: item.supplier.company_name })}
                    >
                      <MessageSquare className="h-4 w-4" /> {isUrdu ? 'چیٹ' : 'Chat'}
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="sm:col-span-2 xl:col-span-3">
              <InlineEmpty>
                {isUrdu ? 'اس پروجیکٹ کے لیے فی الحال کوئی مخصوص سامان لسٹ نہیں ہے۔' : 'No products match this project yet.'}
              </InlineEmpty>
            </div>
          )}
        </div>
        {selectedProducts.length > 1 && (
          <ProductComparison items={(recommendedProducts.data ?? []).filter((item) => selectedProducts.includes(item.product.id))} isUrdu={isUrdu} />
        )}
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-panel sm:p-6">
        <SectionHeading
          eyebrow={isUrdu ? 'شفاف موازنہ' : 'Compare with confidence'}
          title={isUrdu ? 'ٹھیکیداروں کی موصولہ کوٹیشنز' : 'Quotations'}
          description={isUrdu
            ? 'تمام ریٹس اور مدت کا آمنے سامنے موازنہ کریں۔ ایک قبول کرنے پر باقی رد ہو جائیں گی۔'
            : 'Review contractor offers side by side. Accepting one automatically rejects the others.'}
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {quotations.data?.length ? (
            quotations.data.map((quote) => (
              <QuotationCard
                key={quote.id}
                quote={quote}
                onAccept={() => chooseQuotation(quote)}
                onChat={() => setActiveChat({ contractorId: quote.contractor_id, name: quote.contractor?.name ?? 'Contractor', quotationId: quote.id })}
                isUrdu={isUrdu}
              />
            ))
          ) : (
            <div className="lg:col-span-2">
              <InlineEmpty>
                {isUrdu
                  ? 'تجویز کردہ ٹھیکیداروں سے کوٹیشنز طلب کریں تاکہ ان کی آفرز یہاں ظاہر ہوں۔'
                  : 'Request quotations from recommended contractors to compare offers here.'}
              </InlineEmpty>
            </div>
          )}
        </div>
      </section>

      {(activeChat || supplierChat) && (
        <div id="homeowner-chat">
          {activeChat && <ChatPanel projectId={currentProject.id} peerId={activeChat.contractorId} quotationId={activeChat.quotationId} peerName={activeChat.name} />}
          {supplierChat && <ChatPanel projectId={currentProject.id} peerId={supplierChat.supplierId} peerName={supplierChat.name} />}
        </div>
      )}
    </div>
  );
}

function EstimateAnalytics({ project, isUrdu, tx }: { project: Project; isUrdu: boolean; tx: ReturnType<typeof useLanguage>['tx'] }) {
  const estimate = project.ai_estimate_json!;
  const costs = [
    { label: isUrdu ? 'زمین کی کھدائی و تیاری' : 'Land preparation', value: estimate.land_preparation_cost, color: 'bg-cyan-500' },
    { label: isUrdu ? 'بنیادیں' : 'Foundation', value: estimate.foundation_cost ?? 0, color: 'bg-teal-500' },
    { label: isUrdu ? 'گرے اسٹرکچر و چنائی' : 'Structure', value: estimate.structure_cost, color: 'bg-emerald-600' },
    { label: isUrdu ? 'چھت کا لنٹر' : 'Roofing', value: estimate.roofing_cost ?? 0, color: 'bg-indigo-500' },
    { label: isUrdu ? 'بجلی کی وائرنگ' : 'Electrical', value: estimate.electrical_cost, color: 'bg-amber-500' },
    { label: isUrdu ? 'پلمبنگ و سینیٹری' : 'Plumbing', value: estimate.plumbing_cost, color: 'bg-blue-500' },
    { label: isUrdu ? 'رنگ و روغن (پینٹ)' : 'Paint', value: estimate.paint_cost ?? 0, color: 'bg-rose-500' },
    { label: isUrdu ? 'ٹائلز و ماربل' : 'Tiles', value: estimate.tiles_cost ?? 0, color: 'bg-orange-500' },
    { label: isUrdu ? 'دروازے اور کھڑکیاں' : 'Doors & Windows', value: estimate.doors_windows_cost ?? 0, color: 'bg-violet-500' },
    { label: isUrdu ? 'فنشنگ' : 'Finishing', value: estimate.finishing_cost, color: 'bg-emerald-500' },
    { label: isUrdu ? 'مزدوری و کاریگر' : 'Labour cost', value: estimate.labour_cost ?? 0, color: 'bg-purple-500' },
    { label: isUrdu ? 'بنیادی میٹریل' : 'Material cost', value: estimate.material_cost ?? 0, color: 'bg-sky-500' },
    { label: isUrdu ? 'متفرق اخراجات' : 'Miscellaneous', value: estimate.miscellaneous_cost ?? 0, color: 'bg-slate-500' }
  ].filter((cost) => cost.value > 0);

  const max = Math.max(...costs.map((cost) => cost.value));
  const midpoint = (estimate.total_estimate_min + estimate.total_estimate_max) / 2;
  const spread = estimate.total_estimate_max - estimate.total_estimate_min;

  const stageUrdu: Record<string, string> = {
    'Planning': 'منصوبہ بندی',
    'Site Visit': 'سائٹ کا معائنہ',
    'Foundation': 'بنیادیں',
    'Grey Structure': 'گرے اسٹرکچر',
    'Roof': 'چھت کا لنٹر',
    'Electrical': 'بجلی کی وائرنگ',
    'Plaster': 'پلستر',
    'Painting': 'رنگ و روغن',
    'Finishing': 'فنشنگ',
    'Completed': 'مکمل'
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      <div className="rounded-2xl border bg-card p-5 shadow-panel sm:p-6">
        <SectionHeading
          eyebrow={isUrdu ? 'اخراجات کی تقسیم' : 'Cost composition'}
          title={isUrdu ? 'آپ کا بجٹ کہاں خرچ ہوتا ہے' : 'Where your budget goes'}
          description={isUrdu ? 'اے آئی کے مطابق مختلف کیٹیگریز میں اخراجات کی تفصیلی فیصد اور رقم۔' : 'A category-by-category view of the AI estimate.'}
        />
        <div className="mt-7 grid gap-5">
          {costs.map((cost) => (
            <div key={cost.label}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span className="font-semibold">{cost.label}</span>
                <span className="text-muted-foreground font-mono">{formatCurrency(cost.value)}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${cost.color}`} style={{ width: `${Math.max(5, (cost.value / max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        <div className="rounded-2xl border bg-card p-5 shadow-panel sm:p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            {isUrdu ? 'متوقع رینج' : 'Estimate range'}
          </p>
          <div className="mt-5 flex items-end justify-between gap-3">
            <p className="text-sm text-muted-foreground">{isUrdu ? 'اوسط متوقع لاگت' : 'Midpoint'}</p>
            <p className="text-xl font-bold font-mono">{formatCurrency(midpoint)}</p>
          </div>
          <div className="relative mt-6 h-3 rounded-full bg-muted">
            <div className="absolute inset-y-0 left-[10%] right-[10%] rounded-full bg-emerald-500/30" />
            <div className="absolute left-1/2 top-1/2 h-5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600" />
          </div>
          <div className="mt-3 flex justify-between text-xs font-semibold text-muted-foreground">
            <span>{formatCurrency(estimate.total_estimate_min)}</span>
            <span>{formatCurrency(estimate.total_estimate_max)}</span>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            {isUrdu ? 'فرق / رینج سپریڈ:' : 'Range spread:'} {formatCurrency(spread)}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-panel sm:p-6">
          <p className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
            <Bot className="h-4 w-4" /> {isUrdu ? 'اے آئی تجزیہ اور خلاصہ' : 'AI summary'}
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{estimate.explanation}</p>
          {estimate.pricing_basis && (
            <p className="mt-4 border-t pt-3 text-xs italic text-muted-foreground">{estimate.pricing_basis}</p>
          )}
        </div>

        {estimate.timeline && (
          <div className="rounded-2xl border bg-card p-5 shadow-panel sm:p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              {isUrdu ? 'متوقع مدت تکمیل' : 'Estimated Timeline'}
            </p>
            <p className="mt-3 text-lg font-bold">{estimate.timeline}</p>
            {estimate.confidence !== undefined && (
              <p className="mt-2 text-xs text-muted-foreground">
                {isUrdu ? 'تخمینے کا اعتماد:' : 'AI Estimation Confidence:'} {estimate.confidence}%
              </p>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-panel lg:col-span-2 sm:p-6">
        <p className="mb-5 text-sm font-bold">{isUrdu ? 'تعمیراتی مراحل کی پیش رفت' : 'Project journey'}</p>
        <div className="grid gap-3 sm:grid-cols-5">
          {projectProgressStages.map((status, index) => {
            const activeIndex = projectProgressStages.indexOf(project.progress_stage ?? 'Planning');
            const complete = index <= activeIndex;
            const displayLabel = isUrdu ? (stageUrdu[status] || status) : status;
            return (
              <div
                key={status}
                className={`flex items-center gap-3 rounded-xl border p-3 text-sm font-semibold ${
                  complete ? 'border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'
                }`}
              >
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full text-xs ${
                    complete ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {complete ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                {displayLabel}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ContractorRow({
  contractor,
  onRequest,
  isUrdu
}: {
  contractor: ContractorMatch;
  onRequest: () => void;
  isUrdu: boolean;
}) {
  return (
    <div className="rounded-xl border p-4 transition-all hover:shadow-panel hover:border-emerald-500/40">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <Link
            to={`/contractors/${contractor.user_id}`}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-500/10 font-bold text-emerald-600 hover:bg-emerald-500/20 transition-colors"
          >
            {contractor.name.slice(0, 2).toUpperCase()}
          </Link>
          <div>
            <Link to={`/contractors/${contractor.user_id}`} className="font-bold hover:text-emerald-600 transition-colors hover:underline">
              {contractor.name}
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">{contractor.specialization} · {contractor.city ?? 'Flexible'}</p>
          </div>
        </div>
        <Button size="sm" onClick={onRequest} className="gap-1.5 font-semibold">
          <Send className="h-4 w-4" /> {isUrdu ? 'کوٹیشن مانگیں' : 'Request quote'}
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t pt-3 text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> {contractor.average_rating.toFixed(1)}</span>
        <span>{contractor.experience_years} {isUrdu ? 'سال تجربہ' : 'years experience'}</span>
        <span>{contractor.completed_projects} {isUrdu ? 'مکمل منصوبے' : 'projects'}</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{Math.round(contractor.match_score)}% {isUrdu ? 'میچ' : 'match'}</span>
      </div>
    </div>
  );
}

function QuotationCard({
  quote,
  onAccept,
  onChat,
  isUrdu
}: {
  quote: Quotation;
  onAccept: () => void;
  onChat: () => void;
  isUrdu: boolean;
}) {
  return (
    <div className="rounded-xl border p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold">{quote.contractor?.name ?? 'Contractor'}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {quote.contractor?.city ?? 'City not set'}
          </p>
        </div>
        <Badge tone={quote.status === 'accepted' ? 'success' : quote.status === 'rejected' ? 'danger' : 'neutral'}>
          {quote.status}
        </Badge>
      </div>
      <p className="mt-4 text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
        {quote.amount ? formatCurrency(quote.amount) : (isUrdu ? 'کوٹیشن کا انتظار' : 'Awaiting quote')}
      </p>
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
        {quote.duration_days && (
          <span className="flex items-center gap-1">
            <Clock3 className="h-4 w-4" /> {quote.duration_days} {isUrdu ? 'دن' : 'days'}
          </span>
        )}
        {quote.timeline && (
          <span className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" /> {quote.timeline}
          </span>
        )}
      </div>
      {quote.notes && <p className="mt-4 border-t pt-4 text-sm leading-6 text-muted-foreground">{quote.notes}</p>}
      <div className="mt-5 flex gap-2">
        {quote.status === 'negotiating' && (
          <Button size="sm" onClick={onAccept} className="font-semibold gap-1">
            <Check className="h-4 w-4" /> {isUrdu ? 'منظور کریں' : 'Accept'}
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={onChat} className="font-semibold gap-1">
          <MessageSquare className="h-4 w-4" /> {isUrdu ? 'چیٹ کریں' : 'Chat'}
        </Button>
      </div>
    </div>
  );
}

function ProductComparison({ items, isUrdu }: { items: RecommendedProduct[]; isUrdu: boolean }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="p-3">{isUrdu ? 'پروڈکٹ / سپلائر' : 'Product / Supplier'}</th>
            <th className="p-3">{isUrdu ? 'قیمت' : 'Price'}</th>
            <th className="p-3">{isUrdu ? 'رعایت' : 'Discount'}</th>
            <th className="p-3">{isUrdu ? 'ڈلیوری' : 'Delivery'}</th>
            <th className="p-3">{isUrdu ? 'ریٹنگ' : 'Rating'}</th>
            <th className="p-3">{isUrdu ? 'وارنٹی' : 'Warranty'}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.product.id} className="border-t">
              <td className="p-3 font-semibold">
                {item.product.name}
                <span className="block text-xs font-normal text-muted-foreground">{item.supplier.company_name}</span>
              </td>
              <td className="p-3 font-mono">{formatCurrency(item.product.price * (1 - item.product.discount / 100))}</td>
              <td className="p-3">{item.product.discount}%</td>
              <td className="p-3">{item.product.delivery_time ?? (isUrdu ? 'رابطہ پر' : 'On request')}</td>
              <td className="p-3">{item.supplier.average_rating.toFixed(1)}</td>
              <td className="p-3">{item.product.warranty ?? (isUrdu ? 'درج نہیں' : 'Not listed')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Ruler; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-5 sm:px-6">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <p className="mt-1 font-bold">{value}</p>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-bold sm:text-2xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function EstimateUnavailable({
  project,
  onRetry,
  loading,
  isUrdu
}: {
  project: Project;
  onRetry: () => void;
  loading: boolean;
  isUrdu: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-8 text-center shadow-panel">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
        <CircleDollarSign className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-xl font-bold">
        {isUrdu ? 'آپ کا منصوبہ محفوظ کر لیا گیا ہے' : 'Your project is safely saved'}
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
        {project.ai_error ?? (isUrdu ? 'تخمینہ ابھی تیار کیا جا رہا ہے۔ آپ کسی بھی وقت دوبارہ کوشش کر سکتے ہیں۔' : 'The estimate is still being prepared. You can retry at any time.')}
      </p>
      <Button className="mt-5 font-semibold" loading={loading} onClick={onRetry}>
        <RefreshCw className="h-4 w-4" /> {isUrdu ? 'دوبارہ اے آئی تخمینہ لگائیں' : 'Retry AI estimate'}
      </Button>
    </div>
  );
}

function InlineEmpty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">{children}</p>;
}

function EmptyState({ title, description, btnText }: { title: string; description: string; btnText: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border bg-card p-10 text-center shadow-panel">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-3 text-muted-foreground">{description}</p>
      <Link to="/dashboard" className="focus-ring mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-panel hover:bg-emerald-700">
        {btnText}
      </Link>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-40 rounded bg-muted" />
      <div className="h-72 rounded-2xl bg-muted" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-96 rounded-2xl bg-muted" />
        <div className="h-96 rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
