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
  ArchiveRestore
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
  swimming_pool: z.boolean()
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
  swimming_pool: false
};

const steps: Array<{ label: string; eyebrow: string; title: string; description: string; fields: FieldPath<FormValues>[] }> = [
  { label: 'Project', eyebrow: 'Let\'s begin', title: 'Where are you planning to build?', description: 'Start with a name and location for your project.', fields: ['title', 'city'] },
  { label: 'Space', eyebrow: 'Size and scale', title: 'How much space are you working with?', description: 'These dimensions have the largest impact on your estimate.', fields: ['plot_size', 'covered_area', 'floors'] },
  { label: 'Site', eyebrow: 'Ground conditions', title: 'Tell us about the building site', description: 'Site conditions help estimate foundation and preparation costs.', fields: ['soil_type', 'basement'] },
  { label: 'Build', eyebrow: 'Construction plan', title: 'What level of construction do you need?', description: 'Choose the scope and material quality that fit your goals.', fields: ['construction_type', 'material_quality'] },
  { label: 'Finish', eyebrow: 'Look and feel', title: 'Choose your finishing standards', description: 'Select the finish level for the spaces inside and out.', fields: ['interior_finish', 'exterior_finish'] },
  { label: 'Features', eyebrow: 'Final details', title: 'Which features should we include?', description: 'Add every feature you want included in the estimate.', fields: ['parking', 'solar', 'smart_home', 'garden', 'swimming_pool'] },
  { label: 'Review', eyebrow: 'Ready to estimate', title: 'Review your project', description: 'Confirm the details below before BuildWise prepares your estimate.', fields: [] }
];

const featureFields = [
  ['parking', 'Parking'],
  ['solar', 'Solar power'],
  ['smart_home', 'Smart home'],
  ['garden', 'Garden'],
  ['swimming_pool', 'Swimming pool']
] as const;

export function HomeownerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
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
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults, mode: 'onTouched' });

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
      toast({ title: 'Project duplicated successfully', type: 'success' });
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
      toast({ title: variables.archived ? 'Project archived' : 'Project restored', type: 'success' });
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
      toast({ title: 'Project deleted successfully', type: 'success' });
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

  if (phase === 'estimating') return <AiLoadingScreen progress={aiProgress} />;

  const hasProjects = projects.data && projects.data.length > 0;

  if (hasProjects && !showWizard) {
    const filteredProjects = (projects.data ?? []).filter((project) =>
      showArchived ? project.is_archived : !project.is_archived
    );

    return (
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Your Construction Projects</h1>
            <p className="mt-1 text-muted-foreground">View previous estimates, track contractor progress, and manage your projects.</p>
          </div>
          <Button onClick={() => { setEditingProjectId(null); setShowWizard(true); setStep(0); form.reset(defaults); }}>
            <WandSparkles className="mr-2 h-4 w-4" /> Create New Estimate
          </Button>
        </div>

        <div className="mb-6 flex gap-2 border-b pb-4">
          <button
            type="button"
            className={cn("px-4 py-2 text-sm font-semibold rounded-lg transition-colors", !showArchived ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
            onClick={() => setShowArchived(false)}
          >
            Active Projects ({(projects.data ?? []).filter(p => !p.is_archived).length})
          </button>
          <button
            type="button"
            className={cn("px-4 py-2 text-sm font-semibold rounded-lg transition-colors", showArchived ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
            onClick={() => setShowArchived(true)}
          >
            Archived Projects ({(projects.data ?? []).filter(p => p.is_archived).length})
          </button>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground bg-card shadow-sm">
            <p className="font-semibold text-lg">No {showArchived ? 'archived' : 'active'} projects found</p>
            <p className="mt-1 text-sm">Start by creating a new estimate or restoring from archive.</p>
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
                      <div className="flex items-center gap-2">
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
                              swimming_pool: project.swimming_pool
                            });
                            setStep(0);
                            setShowWizard(true);
                          }}
                          aria-label="Edit project"
                          title="Edit project"
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
                          aria-label="Duplicate project"
                          title="Duplicate project"
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
                          aria-label="Archive project"
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
                          aria-label="Delete project"
                          title="Delete project"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="mt-4 text-xl font-bold line-clamp-1">{project.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {project.city} · {project.plot_size} marla
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{project.covered_area.toLocaleString()} sq ft · {project.floors} floors</p>
                      <p>{project.construction_type} · {project.material_quality} Quality</p>
                      {project.progress_stage && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Progress</p>
                          <p className="font-semibold text-primary">{project.progress_stage}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">AI Estimate Range</p>
                        <p className="font-bold text-primary">
                          {minEstimate && maxEstimate ? `${formatCurrency(minEstimate)} - ${formatCurrency(maxEstimate)}` : 'Not estimated'}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/projects/${project.id}/results`)}>
                        View <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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
          <p className="text-sm font-semibold text-primary">New cost estimate</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Plan your construction project</h1>
        </div>
        <div className="flex items-center gap-3">
          {hasProjects && (
            <Button variant="ghost" onClick={() => setShowWizard(false)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to projects
            </Button>
          )}
          {projects.data?.length ? (
            <Select
              aria-label="Open a previous estimate"
              className="w-full sm:w-64"
              defaultValue=""
              onChange={(event) => event.target.value && navigate(`/dashboard/projects/${event.target.value}/results`)}
            >
              <option value="" disabled>Previous estimates</option>
              {projects.data.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}
            </Select>
          ) : null}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span>Step {step + 1} of {steps.length}</span>
        <span>{current.label}</span>
      </div>
      <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${progress}%` }} transition={{ duration: 0.35, ease: 'easeOut' }} />
      </div>

      <form onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}>
        <div className="min-h-[500px] overflow-hidden rounded-lg border bg-card shadow-panel sm:min-h-[520px]">
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
                <p className="text-xs font-bold uppercase tracking-widest text-primary">{current.eyebrow}</p>
                <h2 className="mt-3 text-2xl font-bold sm:text-4xl">{current.title}</h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{current.description}</p>
              </div>

              <div className="flex-1">
                <StepContent step={step} form={form} />
              </div>

              <div className="mt-10 flex items-center justify-between border-t pt-5">
                <Button type="button" variant="ghost" onClick={goBack} disabled={step === 0}>
                  <ArrowLeft className="h-4 w-4" /> Previous
                </Button>
                {step < steps.length - 1 ? (
                  <Button type="button" onClick={goNext}>
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" size="lg" loading={saveMutation.isPending}>
                    <WandSparkles className="h-4 w-4" /> Generate estimate
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
            <span className={index <= step ? 'font-semibold text-primary' : ''}>{item.label}</span>
            {index < steps.length - 1 && <ChevronRight className="h-3 w-3" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepContent({ step, form }: { step: number; form: ReturnType<typeof useForm<FormValues>> }) {
  const errors = form.formState.errors;

  if (step === 0) {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Project name" error={errors.title?.message}>
          <Input autoFocus placeholder="e.g. My family home" {...form.register('title')} />
        </Field>
        <Field label="City" error={errors.city?.message}>
          <Select {...form.register('city')}>{cityOptions.map((option) => <option key={option}>{option}</option>)}</Select>
        </Field>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Plot size (marla)" error={errors.plot_size?.message}><Input type="number" min="0" step="0.1" {...form.register('plot_size')} /></Field>
        <Field label="Covered area (sq ft)" error={errors.covered_area?.message}><Input type="number" min="0" {...form.register('covered_area')} /></Field>
        <Field label="Floors" error={errors.floors?.message}><Input type="number" min="1" max="80" {...form.register('floors')} /></Field>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Soil type" error={errors.soil_type?.message}>
          <Select {...form.register('soil_type')}>{soilOptions.map((option) => <option key={option}>{option}</option>)}</Select>
        </Field>
        <div>
          <p className="mb-2 text-sm font-medium">Basement</p>
          <Toggle label="Include a basement" checked={form.watch('basement')} onChange={(value) => form.setValue('basement', value, { shouldValidate: true, shouldDirty: true })} />
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        <ChoiceGrid label="Construction type" value={form.watch('construction_type')} options={constructionOptions} onChange={(value) => form.setValue('construction_type', value, { shouldValidate: true })} />
        <ChoiceGrid label="Material quality" value={form.watch('material_quality')} options={materialQualityOptions} onChange={(value) => form.setValue('material_quality', value, { shouldValidate: true })} />
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        <ChoiceGrid label="Interior finish" value={form.watch('interior_finish')} options={interiorFinishOptions} onChange={(value) => form.setValue('interior_finish', value, { shouldValidate: true })} />
        <ChoiceGrid label="Exterior finish" value={form.watch('exterior_finish')} options={exteriorFinishOptions} onChange={(value) => form.setValue('exterior_finish', value, { shouldValidate: true })} />
      </div>
    );
  }

  if (step === 5) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {featureFields.map(([field, label]) => (
          <Toggle key={field} label={label} checked={form.watch(field)} onChange={(value) => form.setValue(field, value, { shouldValidate: true, shouldDirty: true })} />
        ))}
      </div>
    );
  }

  const values = form.getValues();
  const selectedFeatures = featureFields.filter(([field]) => values[field]).map(([, label]) => label);
  const reviewItems = [
    { icon: MapPin, label: 'Location', value: `${values.city} · ${values.soil_type} soil` },
    { icon: Ruler, label: 'Space', value: `${values.plot_size} marla · ${values.covered_area.toLocaleString()} sq ft` },
    { icon: Layers3, label: 'Structure', value: `${values.floors} floor${values.floors === 1 ? '' : 's'} · ${values.basement ? 'Basement' : 'No basement'}` },
    { icon: Building2, label: 'Build', value: `${values.construction_type} · ${values.material_quality}` },
    { icon: Home, label: 'Finishes', value: `${values.interior_finish} interior · ${values.exterior_finish} exterior` },
    { icon: Sparkles, label: 'Features', value: selectedFeatures.length ? selectedFeatures.join(', ') : 'No additional features' }
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {reviewItems.map((item) => (
        <div key={item.label} className="flex gap-3 rounded-lg border bg-background/60 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><item.icon className="h-4 w-4" /></span>
          <div><p className="text-xs font-semibold text-muted-foreground">{item.label}</p><p className="mt-1 text-sm font-semibold leading-6">{item.value}</p></div>
        </div>
      ))}
    </div>
  );
}

function ChoiceGrid({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium">{label}</legend>
      <div className="grid gap-2">
        {options.map((option) => {
          const selected = option === value;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`focus-ring flex h-12 items-center justify-between rounded-lg border px-4 text-left text-sm font-semibold ${selected ? 'border-primary bg-primary/10 text-primary' : 'bg-background hover:border-primary/40'}`}
            >
              {option}{selected && <Check className="h-4 w-4" />}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function AiLoadingScreen({ progress }: { progress: number }) {
  const status = progress < 35 ? 'Reading your project details' : progress < 70 ? 'Calculating construction costs' : progress < 96 ? 'Preparing your recommendations' : 'Estimate ready';
  return (
    <div className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-4 text-center">
      <div className="w-full">
        <div className="relative mx-auto mb-8 grid h-24 w-24 place-items-center">
          <motion.div className="absolute inset-0 rounded-full border border-primary/30" animate={{ scale: [1, 1.22, 1], opacity: [0.7, 0, 0.7] }} transition={{ repeat: Infinity, duration: 2.2 }} />
          <div className="grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground shadow-glass">
            <WandSparkles className="h-8 w-8" />
          </div>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">BuildWise AI</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Building your cost estimate</h1>
        <p className="mt-3 text-muted-foreground">{status}</p>
        <div className="mx-auto mt-9 max-w-xl">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: 'easeOut' }} />
          </div>
          <div className="mt-3 flex justify-between text-xs font-semibold text-muted-foreground"><span>Analyzing</span><span>{progress}%</span></div>
        </div>
      </div>
    </div>
  );
}
