import { useEffect, useState } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { z } from 'zod';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  Home,
  Layers3,
  MapPin,
  Ruler,
  Sparkles,
  WandSparkles,
  Trash2,
  Archive,
  Copy,
  Pencil,
  ArchiveRestore,
  Bed,
  Bath,
  Utensils,
  Tv,
  Car,
  Armchair
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  cityOptions,
  constructionOptions,
  exteriorFinishOptions,
  interiorFinishOptions,
  materialQualityOptions,
  soilOptions
} from '../../lib/constants';
import {
  createProject,
  listProjects,
  requestEstimate,
  deleteProject,
  updateProject,
  archiveProject,
  duplicateProject
} from '../../services/projects';
import { listConversationsForUser } from '../../services/chat';
import { Button } from '../../components/ui/button';
import { Field, Input, Select, Toggle } from '../../components/ui/forms';
import { useToast } from '../../components/ui/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '../../components/ui/card';
import { formatCurrency, cn } from '../../lib/utils';
import { DeleteProjectModal } from '../../components/modal/DeleteProjectModal';

const schema = z.object({
  title: z.string().trim().min(3, 'Give your project a descriptive name.'),
  plot_size: z.coerce.number().positive('Enter a valid plot size.'),
  covered_area: z.coerce.number().positive('Enter a valid covered area.'),
  floors: z.coerce.number().int().min(1, 'Choose at least one floor.').max(80),
  basement: z.boolean(),
  city: z.string().min(1, 'Choose a city.'),
  soil_type: z.string().min(1, 'Choose a soil type.'),
  construction_type: z.string().min(1, 'Choose a construction type.'),
  material_quality: z.string().min(1, 'Choose a material quality.'),
  interior_finish: z.string().min(1, 'Choose an interior finish.'),
  exterior_finish: z.string().min(1, 'Choose an exterior finish.'),
  parking: z.boolean(),
  solar: z.boolean(),
  smart_home: z.boolean(),
  garden: z.boolean(),
  swimming_pool: z.boolean(),
  // Room & Layout specifications
  bedrooms: z.coerce.number().int().min(1, 'At least 1 bedroom').max(20),
  bathrooms: z.coerce.number().int().min(1, 'At least 1 bathroom').max(20),
  attached_baths: z.boolean(),
  powder_room: z.boolean(),
  kitchens: z.coerce.number().int().min(1, 'At least 1 kitchen').max(10),
  dirty_kitchen: z.boolean(),
  drawing_dining: z.boolean(),
  tv_lounge: z.boolean(),
  car_porch: z.string().min(1),
  servant_quarter: z.boolean(),
  mumty_rooftop: z.boolean()
});

type FormValues = z.infer<typeof schema>;

const defaults: FormValues = {
  title: 'Family home construction',
  plot_size: 5,
  covered_area: 2400,
  floors: 2,
  basement: false,
  city: 'Lahore',
  soil_type: 'Mixed',
  construction_type: 'Turnkey',
  material_quality: 'Standard',
  interior_finish: 'Standard',
  exterior_finish: 'Basic',
  parking: true,
  solar: false,
  smart_home: false,
  garden: true,
  swimming_pool: false,
  // Layout defaults
  bedrooms: 4,
  bathrooms: 4,
  attached_baths: true,
  powder_room: true,
  kitchens: 2,
  dirty_kitchen: false,
  drawing_dining: true,
  tv_lounge: true,
  car_porch: '2 Cars',
  servant_quarter: false,
  mumty_rooftop: true
};

export function HomeownerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { tx, isUrdu } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [phase, setPhase] = useState<'wizard' | 'estimating'>('wizard');
  const [aiProgress, setAiProgress] = useState(8);
  const [showWizard, setShowWizard] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const projects = useQuery({ queryKey: ['projects', user?.id], queryFn: () => listProjects(user!.id), enabled: Boolean(user?.id) });
  const conversations = useQuery({ queryKey: ['conversations', user?.id], queryFn: () => listConversationsForUser(user!.id), enabled: Boolean(user?.id) });
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults, mode: 'onTouched' });

  const steps: Array<{ label: string; eyebrow: string; title: string; description: string; fields: FieldPath<FormValues>[] }> = [
    {
      label: isUrdu ? 'منصوبہ' : 'Project',
      eyebrow: isUrdu ? 'آئیے آغاز کریں' : "Let's begin",
      title: isUrdu ? 'آپ کہاں تعمیر کرنا چاہتے ہیں؟' : 'Where are you planning to build?',
      description: isUrdu ? 'اپنے منصوبے کا نام اور شہر منتخب کریں۔' : 'Start with a name and location for your project.',
      fields: ['title', 'city']
    },
    {
      label: isUrdu ? 'رقبہ' : 'Space',
      eyebrow: isUrdu ? 'پلاٹ اور کورڈ ایریا' : 'Size and scale',
      title: isUrdu ? 'پلاٹ کا سائز اور رقبہ کتنا ہے؟' : 'How much space are you working with?',
      description: isUrdu ? 'یہ پیمائشیں آپ کے تخمینے پر سب سے زیادہ اثر انداز ہوتی ہیں۔' : 'These dimensions have the largest impact on your estimate.',
      fields: ['plot_size', 'covered_area', 'floors']
    },
    {
      label: isUrdu ? 'لے آؤٹ' : 'Layout',
      eyebrow: isUrdu ? 'کمرے اور فلور پلان' : 'Rooms & Floor Plan',
      title: isUrdu ? 'آپ کو کتنے کمروں کی ضرورت ہے؟' : 'How many rooms and spaces do you need?',
      description: isUrdu ? 'بیڈ رومز، باتھ رومز، کچن اور پورچ کی تفصیلات درج کریں۔' : 'Specify bedrooms, attached bathrooms, kitchens per floor, and key spaces.',
      fields: ['bedrooms', 'bathrooms', 'kitchens', 'car_porch']
    },
    {
      label: isUrdu ? 'زمین' : 'Site',
      eyebrow: isUrdu ? 'سائٹ کی حالت' : 'Ground conditions',
      title: isUrdu ? 'تعمیراتی جگہ کی تفصیل بتائیں' : 'Tell us about the building site',
      description: isUrdu ? 'مٹی کی قسم اور تہہ خانے سے بنیادوں کی لاگت کا درست تعین ہوتا ہے۔' : 'Site conditions help estimate foundation and preparation costs.',
      fields: ['soil_type', 'basement']
    },
    {
      label: isUrdu ? 'تعمیر' : 'Build',
      eyebrow: isUrdu ? 'تعمیراتی پیکج' : 'Construction plan',
      title: isUrdu ? 'تعمیراتی پیکج اور میٹریل کا گریڈ منتخب کریں' : 'What level of construction do you need?',
      description: isUrdu ? 'گرے اسٹرکچر یا ٹرن کی اور میٹریل کوالٹی منتخب کریں۔' : 'Choose the scope and material quality that fit your goals.',
      fields: ['construction_type', 'material_quality']
    },
    {
      label: isUrdu ? 'فنشنگ' : 'Finish',
      eyebrow: isUrdu ? 'ڈیزائن اور فنشنگ' : 'Look and feel',
      title: isUrdu ? 'اندرونی و بیرونی فنشنگ کا معیار' : 'Choose your finishing standards',
      description: isUrdu ? 'ٹائلز، پینٹ اور ایلیویشن کا معیار طے کریں۔' : 'Select the finish level for the spaces inside and out.',
      fields: ['interior_finish', 'exterior_finish']
    },
    {
      label: isUrdu ? 'سہولیات' : 'Features',
      eyebrow: isUrdu ? 'اضافی فیچرز' : 'Final details',
      title: isUrdu ? 'کونسی جدید سہولیات شامل کرنا چاہتے ہیں؟' : 'Which features should we include?',
      description: isUrdu ? 'سولر، سمارٹ آٹومیشن، لان یا پول کا انتخاب کریں۔' : 'Add every feature you want included in the estimate.',
      fields: ['parking', 'solar', 'smart_home', 'garden', 'swimming_pool']
    },
    {
      label: isUrdu ? 'جائزہ' : 'Review',
      eyebrow: isUrdu ? 'تخمینہ تیار ہے' : 'Ready to estimate',
      title: isUrdu ? 'اپنے منصوبے کی تفصیلات کا جائزہ لیں' : 'Review your project',
      description: isUrdu ? 'اے آئی کے ذریعے تفصیلی تخمینہ تیار کرنے سے پہلے تصدیق کریں۔' : 'Confirm the details below before BuildWise prepares your estimate.',
      fields: []
    }
  ];

  useEffect(() => {
    if (phase !== 'estimating') return;
    const timer = window.setInterval(() => setAiProgress((value) => Math.min(value + Math.max(1, Math.round((94 - value) / 8)), 94)), 420);
    return () => window.clearInterval(timer);
  }, [phase]);

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      setPhase('estimating');
      setAiProgress(12);
      const startedAt = Date.now();
      let project;
      if (editingProjectId) {
        project = await updateProject(editingProjectId, values);
      } else {
        project = await createProject(user!.id, values);
      }
      setAiProgress(48);
      try {
        await requestEstimate(project.id);
        setAiProgress(96);
      } catch (error) {
        toast({
          title: 'Project saved, estimation needs retry',
          description: error instanceof Error ? error.message : 'AI estimation is temporarily unavailable.',
          type: 'error'
        });
      }
      const remainingDelay = Math.max(0, 1600 - (Date.now() - startedAt));
      await new Promise((resolve) => window.setTimeout(resolve, remainingDelay));
      setAiProgress(100);
      await new Promise((resolve) => window.setTimeout(resolve, 260));
      return project;
    },
    onSuccess: async (project) => {
      await queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      setShowWizard(false);
      setEditingProjectId(null);
      navigate(`/dashboard/projects/${project.id}/results`);
    },
    onError: (error) => {
      setPhase('wizard');
      toast({ title: 'Could not save project', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: async (projectId: string) => {
      return duplicateProject(projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      toast({ title: isUrdu ? 'منصوبہ کامیابی سے کاپی ہو گیا' : 'Project duplicated successfully', type: 'success' });
    },
    onError: (error) => {
      toast({ title: 'Failed to duplicate project', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    }
  });

  const archiveMutation = useMutation({
    mutationFn: async ({ projectId, archived }: { projectId: string; archived: boolean }) => {
      return archiveProject(projectId, archived);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      toast({ title: variables.archived ? (isUrdu ? 'منصوبہ آرکائیو ہو گیا' : 'Project archived') : (isUrdu ? 'منصوبہ بحال ہو گیا' : 'Project restored'), type: 'success' });
    },
    onError: (error) => {
      toast({ title: 'Action failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (projectId: string) => {
      await deleteProject(projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      toast({ title: isUrdu ? 'منصوبہ حذف کر دیا گیا ہے' : 'Project deleted successfully', type: 'success' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete project', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    }
  });

  async function goNext() {
    const valid = await form.trigger(steps[step].fields, { shouldFocus: true });
    if (!valid) return;
    setDirection(1);
    setStep((value) => Math.min(value + 1, steps.length - 1));
  }

  function goBack() {
    setDirection(-1);
    setStep((value) => Math.max(value - 1, 0));
  }

  if (phase === 'estimating') return <AiLoadingScreen progress={aiProgress} isUrdu={isUrdu} />;

  const hasProjects = projects.data && projects.data.length > 0;

  if (hasProjects && !showWizard) {
    const filteredProjects = (projects.data ?? []).filter((project) =>
      showArchived ? project.is_archived : !project.is_archived
    );

    return (
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {isUrdu ? 'آپ کے تعمیراتی منصوبے' : 'Your Construction Projects'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {isUrdu
                ? 'سابقہ تخمینے دیکھیں، ٹھیکیداروں کی کوٹیشنز اور پیش رفت کی نگرانی کریں۔'
                : 'View previous estimates, track contractor progress, and manage your projects.'}
            </p>
          </div>
          <Button onClick={() => { setEditingProjectId(null); setShowWizard(true); setStep(0); form.reset(defaults); }} className="gap-2 font-semibold">
            <WandSparkles className="h-4 w-4" /> {tx.estimator.newProject}
          </Button>
        </div>

        <div className="mb-6 flex gap-2 border-b pb-4">
          <button
            type="button"
            className={cn("px-4 py-2 text-sm font-semibold rounded-lg transition-colors", !showArchived ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
            onClick={() => setShowArchived(false)}
          >
            {tx.estimator.activeProjects} ({(projects.data ?? []).filter(p => !p.is_archived).length})
          </button>
          <button
            type="button"
            className={cn("px-4 py-2 text-sm font-semibold rounded-lg transition-colors", showArchived ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
            onClick={() => setShowArchived(true)}
          >
            {tx.estimator.archivedProjects} ({(projects.data ?? []).filter(p => p.is_archived).length})
          </button>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground bg-card shadow-sm">
            <p className="font-semibold text-lg">
              {showArchived
                ? (isUrdu ? 'کوئی آرکائیو شدہ منصوبہ نہیں ملا' : 'No archived projects found')
                : (isUrdu ? 'کوئی جاری منصوبہ نہیں ہے' : 'No active projects found')}
            </p>
            <p className="mt-1 text-sm">{tx.estimator.noProjectsYet}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => {
              const minEstimate = project.ai_estimate_json?.total_estimate_min;
              const maxEstimate = project.ai_estimate_json?.total_estimate_max;
              return (
                <Card key={project.id} className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        <Home className="h-5 w-5" />
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge>
                          {project.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditingProjectId(project.id);
                            form.reset({
                              title: project.title,
                              plot_size: project.plot_size,
                              covered_area: project.covered_area,
                              floors: project.floors,
                              basement: project.basement,
                              city: project.city,
                              soil_type: project.soil_type,
                              construction_type: project.construction_type,
                              material_quality: project.material_quality,
                              interior_finish: project.interior_finish,
                              exterior_finish: project.exterior_finish,
                              parking: project.parking,
                              solar: project.solar,
                              smart_home: project.smart_home,
                              garden: project.garden,
                              swimming_pool: project.swimming_pool,
                              bedrooms: 4,
                              bathrooms: 4,
                              attached_baths: true,
                              powder_room: true,
                              kitchens: 2,
                              dirty_kitchen: false,
                              drawing_dining: true,
                              tv_lounge: true,
                              car_porch: '2 Cars',
                              servant_quarter: false,
                              mumty_rooftop: true
                            });
                            setStep(0);
                            setShowWizard(true);
                          }}
                          aria-label={tx.edit}
                          title={tx.edit}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            duplicateMutation.mutate(project.id);
                          }}
                          disabled={duplicateMutation.isPending}
                          aria-label={tx.duplicate}
                          title={tx.duplicate}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            archiveMutation.mutate({ projectId: project.id, archived: !project.is_archived });
                          }}
                          disabled={archiveMutation.isPending}
                          aria-label={tx.archive}
                          title={project.is_archived ? "Restore project" : "Archive project"}
                        >
                          {project.is_archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteTarget({ id: project.id, title: project.title });
                          }}
                          aria-label={tx.delete}
                          title={tx.delete}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="mt-4 text-xl font-bold line-clamp-1">{project.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {project.city} · {project.plot_size} {tx.marla}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{project.covered_area.toLocaleString()} {tx.sqft} · {project.floors} {isUrdu ? 'منزلیں' : 'floors'}</p>
                      <p>{project.construction_type} · {project.material_quality} {isUrdu ? 'معیار' : 'Quality'}</p>
                      {project.progress_stage && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">{isUrdu ? 'تعمیراتی مرحلہ' : 'Progress'}</p>
                          <p className="font-semibold text-primary">{project.progress_stage}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{tx.estimator.totalEstimatedCost}</p>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">
                          {minEstimate && maxEstimate ? `${formatCurrency(minEstimate)} - ${formatCurrency(maxEstimate)}` : (isUrdu ? 'تخمینہ درکار ہے' : 'Not estimated')}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/projects/${project.id}/results`)}>
                        {tx.viewDetails} <ChevronRight className={isUrdu ? 'mr-1 h-4 w-4 rotate-180' : 'ml-1 h-4 w-4'} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {conversations.data && conversations.data.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{isUrdu ? 'حالیہ پیغامات و بات چیت' : 'Recent Messages'}</CardTitle>
              <CardDescription>{isUrdu ? 'اپنے ٹھیکیداروں اور سپلائرز کے ساتھ بات چیت جاری رکھیں۔' : 'Resume chatting with your contractors and suppliers.'}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {conversations.data.slice(0, 6).map((thread) => {
                const isContractor = Boolean(thread.contractor_id);
                const peerName = isContractor ? (thread.contractor?.name ?? 'Contractor') : (thread.supplier?.name ?? 'Supplier');
                const targetUrl = isContractor
                  ? `/dashboard/projects/${thread.project_id}/results?chatContractorId=${thread.contractor_id}&name=${encodeURIComponent(peerName)}&quotationId=${thread.quotation_id || ''}`
                  : `/dashboard/projects/${thread.project_id}/results?chatSupplierId=${thread.supplier_id}&name=${encodeURIComponent(peerName)}`;
                return (
                  <button
                    key={thread.id}
                    type="button"
                    className="rounded-xl border p-4 text-left hover:bg-muted transition-colors flex flex-col justify-between"
                    onClick={() => navigate(targetUrl)}
                  >
                    <div>
                      <p className="font-semibold">{peerName}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{thread.projects?.title ?? 'Project conversation'}</p>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">{thread.last_message_at ? new Date(thread.last_message_at).toLocaleString() : 'No messages yet'}</p>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        )}

        <DeleteProjectModal
          open={Boolean(deleteTarget)}
          projectTitle={deleteTarget?.title ?? ''}
          loading={deleteMutation.isPending}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (deleteTarget) {
              deleteMutation.mutate(deleteTarget.id, {
                onSuccess: () => setDeleteTarget(null)
              });
            }
          }}
        />
      </div>
    );
  }

  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {isUrdu ? 'نیا لاگت کا تخمینہ' : 'New cost estimate'}
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            {isUrdu ? 'اپنے تعمیراتی منصوبے کی منصوبہ بندی کریں' : 'Plan your construction project'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {hasProjects && (
            <Button variant="ghost" onClick={() => setShowWizard(false)}>
              <ArrowLeft className={isUrdu ? 'ml-2 h-4 w-4 rotate-180' : 'mr-2 h-4 w-4'} />
              {isUrdu ? 'منصوبوں پر واپس جائیں' : 'Back to projects'}
            </Button>
          )}
          {projects.data?.length ? (
            <Select
              aria-label="Open a previous estimate"
              className="w-full sm:w-64"
              defaultValue=""
              onChange={(event) => event.target.value && navigate(`/dashboard/projects/${event.target.value}/results`)}
            >
              <option value="" disabled>{isUrdu ? 'سابقہ تخمینے دیکھیں' : 'Previous estimates'}</option>
              {projects.data.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}
            </Select>
          ) : null}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span>{isUrdu ? `مرحلہ ${step + 1} از ${steps.length}` : `Step ${step + 1} of ${steps.length}`}</span>
        <span>{current.label}</span>
      </div>
      <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500" animate={{ width: `${progress}%` }} transition={{ duration: 0.35, ease: 'easeOut' }} />
      </div>

      <form onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}>
        <div className="min-h-[500px] overflow-hidden rounded-2xl border bg-card shadow-panel sm:min-h-[520px]">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.section
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 36 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -36 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto flex min-h-[500px] max-w-3xl flex-col px-5 py-8 sm:min-h-[520px] sm:px-10 sm:py-12"
            >
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">{current.eyebrow}</p>
                <h2 className="mt-3 text-2xl font-bold sm:text-4xl">{current.title}</h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{current.description}</p>
              </div>

              <div className="flex-1">
                <StepContent step={step} form={form} isUrdu={isUrdu} tx={tx} />
              </div>

              <div className="mt-10 flex items-center justify-between border-t pt-5">
                <Button type="button" variant="ghost" onClick={goBack} disabled={step === 0}>
                  <ArrowLeft className={isUrdu ? 'ml-2 h-4 w-4 rotate-180' : 'mr-2 h-4 w-4'} /> {tx.back}
                </Button>
                {step < steps.length - 1 ? (
                  <Button type="button" onClick={goNext}>
                    {tx.next} <ArrowRight className={isUrdu ? 'mr-2 h-4 w-4 rotate-180' : 'ml-2 h-4 w-4'} />
                  </Button>
                ) : (
                  <Button type="submit" size="lg" loading={saveMutation.isPending} className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                    <WandSparkles className="mr-2 h-4 w-4" /> {tx.estimator.calculateEstimate}
                  </Button>
                )}
              </div>
            </motion.section>
          </AnimatePresence>
        </div>
      </form>

      <div className="mt-5 hidden items-center justify-center gap-2 text-xs text-muted-foreground sm:flex">
        {steps.map((item, index) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={index <= step ? 'font-semibold text-emerald-600 dark:text-emerald-400' : ''}>{item.label}</span>
            {index < steps.length - 1 && <ChevronRight className={isUrdu ? 'h-3 w-3 rotate-180' : 'h-3 w-3'} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepContent({
  step,
  form,
  isUrdu,
  tx
}: {
  step: number;
  form: ReturnType<typeof useForm<FormValues>>;
  isUrdu: boolean;
  tx: ReturnType<typeof useLanguage>['tx'];
}) {
  const errors = form.formState.errors;

  if (step === 0) {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={tx.estimator.projectTitleLabel} error={errors.title?.message}>
          <Input autoFocus placeholder={tx.estimator.projectTitlePlaceholder} {...form.register('title')} />
        </Field>
        <Field label={tx.estimator.cityLabel} error={errors.city?.message}>
          <Select {...form.register('city')}>
            {cityOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </Select>
        </Field>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="grid gap-6 sm:grid-cols-3">
        <Field label={`${tx.estimator.plotSizeLabel}`} error={errors.plot_size?.message}>
          <Input type="number" min="0" step="0.1" {...form.register('plot_size')} />
          <p className="mt-1 text-xs text-muted-foreground">{tx.estimator.plotSizeHelp}</p>
        </Field>
        <Field label={`${tx.estimator.coveredAreaLabel}`} error={errors.covered_area?.message}>
          <Input type="number" min="0" {...form.register('covered_area')} />
          <p className="mt-1 text-xs text-muted-foreground">{tx.estimator.coveredAreaHelp}</p>
        </Field>
        <Field label={tx.estimator.floorsLabel} error={errors.floors?.message}>
          <Input type="number" min="1" max="80" {...form.register('floors')} />
        </Field>
      </div>
    );
  }

  // Step 2: Rooms & Layout
  if (step === 2) {
    const carPorchOptions = [
      { value: '1 Car', label: isUrdu ? '1 چھوٹی گاڑی' : '1 Car' },
      { value: '2 Cars', label: isUrdu ? '2 گاڑیاں' : '2 Cars' },
      { value: '3+ Cars', label: isUrdu ? '3 یا زائد گاڑیاں' : '3+ Cars' }
    ];
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={tx.estimator.bedrooms} error={errors.bedrooms?.message}>
            <Input type="number" min="1" max="20" {...form.register('bedrooms', { valueAsNumber: true })} />
          </Field>
          <Field label={tx.estimator.bathrooms} error={errors.bathrooms?.message}>
            <Input type="number" min="1" max="20" {...form.register('bathrooms', { valueAsNumber: true })} />
          </Field>
          <Field label={tx.estimator.kitchens} error={errors.kitchens?.message}>
            <Input type="number" min="1" max="10" {...form.register('kitchens', { valueAsNumber: true })} />
          </Field>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {isUrdu ? 'منسلک باتھ رومز اور کچن کا لے آؤٹ' : 'Attached Bathrooms & Kitchen Layout'}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              label={tx.estimator.attachedBaths}
              checked={form.watch('attached_baths')}
              onChange={(v) => form.setValue('attached_baths', v, { shouldValidate: true, shouldDirty: true })}
            />
            <Toggle
              label={tx.estimator.powderRoom}
              checked={form.watch('powder_room')}
              onChange={(v) => form.setValue('powder_room', v, { shouldValidate: true, shouldDirty: true })}
            />
            <Toggle
              label={isUrdu ? 'ہر فلور پر کچن' : 'Kitchen on both/each floor'}
              checked={form.watch('kitchens') >= 2}
              onChange={(v) => form.setValue('kitchens', v ? Math.max(2, form.watch('kitchens')) : 1, { shouldValidate: true, shouldDirty: true })}
            />
            <Toggle
              label={tx.estimator.dirtyKitchen}
              checked={form.watch('dirty_kitchen')}
              onChange={(v) => form.setValue('dirty_kitchen', v, { shouldValidate: true, shouldDirty: true })}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {isUrdu ? 'رہائشی حصے اور دیگر جگہیں' : 'Living Spaces & Utilities'}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              label={tx.estimator.drawingDining}
              checked={form.watch('drawing_dining')}
              onChange={(v) => form.setValue('drawing_dining', v, { shouldValidate: true, shouldDirty: true })}
            />
            <Toggle
              label={tx.estimator.tvLounge}
              checked={form.watch('tv_lounge')}
              onChange={(v) => form.setValue('tv_lounge', v, { shouldValidate: true, shouldDirty: true })}
            />
            <Toggle
              label={tx.estimator.mumtyRooftop}
              checked={form.watch('mumty_rooftop')}
              onChange={(v) => form.setValue('mumty_rooftop', v, { shouldValidate: true, shouldDirty: true })}
            />
            <Toggle
              label={tx.estimator.servantQuarter}
              checked={form.watch('servant_quarter')}
              onChange={(v) => form.setValue('servant_quarter', v, { shouldValidate: true, shouldDirty: true })}
            />
          </div>
        </div>

        <div>
          <ChoiceGridMapped
            label={tx.estimator.carPorch}
            value={form.watch('car_porch')}
            options={carPorchOptions}
            onChange={(v) => form.setValue('car_porch', v, { shouldValidate: true })}
          />
        </div>
      </div>
    );
  }

  if (step === 3) {
    const soilMapped = soilOptions.map((opt) => ({
      value: opt,
      label: isUrdu
        ? opt === 'Clay' ? 'چکنی مٹی (Clay)' : opt === 'Sandy' ? 'ریتلی مٹی (Sandy)' : opt === 'Rocky' ? 'پتھریلی مٹی (Rocky)' : 'عام مکس مٹی (Mixed)'
        : opt
    }));

    return (
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={tx.estimator.soilTypeLabel} error={errors.soil_type?.message}>
          <Select {...form.register('soil_type')}>
            {soilMapped.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </Field>
        <div>
          <p className="mb-2 text-sm font-medium">{tx.estimator.basementLabel}</p>
          <Toggle
            label={tx.estimator.basementDesc}
            checked={form.watch('basement')}
            onChange={(value) => form.setValue('basement', value, { shouldValidate: true, shouldDirty: true })}
          />
        </div>
      </div>
    );
  }

  if (step === 4) {
    const constructionMapped = constructionOptions.map((opt) => ({
      value: opt,
      label: isUrdu ? (opt === 'Grey Structure' ? 'گرے اسٹرکچر (صرف بنیادی ڈھانچہ)' : 'ٹرن کی (مکمل فنشنگ کے ساتھ)') : opt
    }));
    const qualityMapped = materialQualityOptions.map((opt) => ({
      value: opt,
      label: isUrdu ? (opt === 'Economy' ? 'اکنامی (بجٹ فرینڈلی)' : opt === 'Standard' ? 'اسٹینڈرڈ (معیاری)' : opt === 'Premium' ? 'پریمیم (اعلیٰ کوالٹی)' : 'لگژری (شاہانہ)') : opt
    }));

    return (
      <div className="grid gap-6 sm:grid-cols-2">
        <ChoiceGridMapped
          label={tx.estimator.constructionTypeLabel}
          value={form.watch('construction_type')}
          options={constructionMapped}
          onChange={(value) => form.setValue('construction_type', value, { shouldValidate: true })}
        />
        <ChoiceGridMapped
          label={tx.estimator.materialQualityLabel}
          value={form.watch('material_quality')}
          options={qualityMapped}
          onChange={(value) => form.setValue('material_quality', value, { shouldValidate: true })}
        />
      </div>
    );
  }

  if (step === 5) {
    const interiorMapped = interiorFinishOptions.map((opt) => ({
      value: opt,
      label: isUrdu ? (opt === 'Basic' ? 'بنیادی (Basic)' : opt === 'Standard' ? 'معیاری (Standard)' : 'اعلیٰ پریمیم (Premium)') : opt
    }));
    const exteriorMapped = exteriorFinishOptions.map((opt) => ({
      value: opt,
      label: isUrdu ? (opt === 'Basic' ? 'سادہ پینٹ و موسم مزاحم' : 'پریمیم ایلیویشن و ٹائلز') : opt
    }));

    return (
      <div className="grid gap-6 sm:grid-cols-2">
        <ChoiceGridMapped
          label={tx.estimator.interiorFinishLabel}
          value={form.watch('interior_finish')}
          options={interiorMapped}
          onChange={(value) => form.setValue('interior_finish', value, { shouldValidate: true })}
        />
        <ChoiceGridMapped
          label={tx.estimator.exteriorFinishLabel}
          value={form.watch('exterior_finish')}
          options={exteriorMapped}
          onChange={(value) => form.setValue('exterior_finish', value, { shouldValidate: true })}
        />
      </div>
    );
  }

  if (step === 6) {
    const featuresList = [
      { key: 'parking' as const, label: tx.estimator.parkingSpace },
      { key: 'solar' as const, label: tx.estimator.solarPanels },
      { key: 'smart_home' as const, label: tx.estimator.smartHome },
      { key: 'garden' as const, label: tx.estimator.lawnGarden },
      { key: 'swimming_pool' as const, label: tx.estimator.swimmingPool }
    ];

    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {featuresList.map((item) => (
          <Toggle
            key={item.key}
            label={item.label}
            checked={form.watch(item.key)}
            onChange={(value) => form.setValue(item.key, value, { shouldValidate: true, shouldDirty: true })}
          />
        ))}
      </div>
    );
  }

  const values = form.getValues();
  const selectedFeatures = [
    values.parking && tx.estimator.parkingSpace,
    values.solar && tx.estimator.solarPanels,
    values.smart_home && tx.estimator.smartHome,
    values.garden && tx.estimator.lawnGarden,
    values.swimming_pool && tx.estimator.swimmingPool
  ].filter(Boolean);

  const layoutSummary = `${values.bedrooms} ${tx.estimator.bedrooms} · ${values.bathrooms} ${tx.estimator.bathrooms} · ${values.kitchens} ${tx.estimator.kitchens} · ${values.car_porch}`;
  const spaceExtras = [
    values.drawing_dining && (isUrdu ? 'ڈرائنگ/ڈائننگ' : 'Drawing/Dining'),
    values.tv_lounge && (isUrdu ? 'ٹی وی لاؤنج' : 'TV Lounge'),
    values.powder_room && (isUrdu ? 'پاؤڈر روم' : 'Powder Room'),
    values.dirty_kitchen && (isUrdu ? 'ڈرٹی کچن' : 'Dirty Kitchen'),
    values.servant_quarter && (isUrdu ? 'سرونٹ کوارٹر' : 'Servant Quarter'),
    values.mumty_rooftop && (isUrdu ? 'ممٹی و چھت' : 'Mumty')
  ].filter(Boolean).join(', ');

  const reviewItems = [
    { icon: MapPin, label: isUrdu ? 'مقام اور مٹی' : 'Location', value: `${values.city} · ${values.soil_type}` },
    { icon: Ruler, label: isUrdu ? 'رقبہ و سائز' : 'Space', value: `${values.plot_size} ${tx.marla} · ${values.covered_area.toLocaleString()} ${tx.sqft}` },
    { icon: Bed, label: isUrdu ? 'کمروں کی ترتیب' : 'Room Layout', value: layoutSummary },
    { icon: Armchair, label: isUrdu ? 'رہائشی حصے' : 'Living Spaces', value: spaceExtras || (isUrdu ? 'معیاری لے آؤٹ' : 'Standard layout') },
    { icon: Layers3, label: isUrdu ? 'منزلیں و بنیاد' : 'Structure', value: `${values.floors} ${isUrdu ? 'منزلیں' : 'floors'} · ${values.basement ? (isUrdu ? 'بیسمنٹ سمیت' : 'Basement') : (isUrdu ? 'بغیر بیسمنٹ' : 'No basement')}` },
    { icon: Building2, label: isUrdu ? 'تعمیراتی پیکج' : 'Build', value: `${values.construction_type} · ${values.material_quality}` },
    { icon: Home, label: isUrdu ? 'فنشنگ معیار' : 'Finishes', value: `${values.interior_finish} / ${values.exterior_finish}` },
    { icon: Sparkles, label: isUrdu ? 'خصوصی سہولیات' : 'Special Features', value: selectedFeatures.length ? selectedFeatures.join(', ') : (isUrdu ? 'کوئی اضافی فیچر نہیں' : 'No additional features') }
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {reviewItems.map((item) => (
        <div key={item.label} className="flex gap-3 rounded-xl border bg-background/60 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <item.icon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-sm font-semibold leading-6">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChoiceGridMapped({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium">{label}</legend>
      <div className="grid gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`focus-ring flex h-12 items-center justify-between rounded-lg border px-4 text-left text-sm font-semibold transition-all ${
                selected ? 'border-emerald-600 bg-emerald-50/20 text-emerald-700 dark:text-emerald-400 font-bold' : 'bg-background hover:border-emerald-500/40'
              }`}
            >
              <span>{option.label}</span>
              {selected && <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function AiLoadingScreen({ progress, isUrdu }: { progress: number; isUrdu: boolean }) {
  const status = isUrdu
    ? progress < 35
      ? 'منصوبے کی تمام تفصیلات کا جائزہ لیا جا رہا ہے'
      : progress < 70
      ? 'سیمنٹ، سریہ، اینٹ اور لیبر کی موجودہ لاگت کا حساب لگایا جا رہا ہے'
      : progress < 96
      ? 'بہترین تصدیق شدہ ٹھیکیداروں اور ریٹس کی رپورٹ تیار کی جا رہی ہے'
      : 'تخمینہ مکمل تیار ہے!'
    : progress < 35
    ? 'Reading your project details'
    : progress < 70
    ? 'Calculating construction costs based on current rates'
    : progress < 96
    ? 'Preparing your recommendations and contractor matches'
    : 'Estimate ready';

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-4 text-center">
      <div className="w-full">
        <div className="relative mx-auto mb-8 grid h-24 w-24 place-items-center">
          <motion.div className="absolute inset-0 rounded-full border border-emerald-500/30" animate={{ scale: [1, 1.22, 1], opacity: [0.7, 0, 0.7] }} transition={{ repeat: Infinity, duration: 2.2 }} />
          <div className="grid h-20 w-20 place-items-center rounded-full bg-emerald-600 text-white shadow-glass">
            <WandSparkles className="h-8 w-8" />
          </div>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">BuildWise AI</p>
        <h1 className="mt-3 text-2xl sm:text-4xl font-bold">
          {isUrdu ? 'تعمیراتی لاگت کا تخمینہ تیار ہو رہا ہے' : 'Building your cost estimate'}
        </h1>
        <p className="mt-3 text-muted-foreground">{status}</p>
        <div className="mx-auto mt-9 max-w-xl">
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <motion.div className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500" animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: 'easeOut' }} />
          </div>
          <div className="mt-3 flex justify-between text-xs font-semibold text-muted-foreground">
            <span>{isUrdu ? 'تجزیہ و حساب' : 'Analyzing'}</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
