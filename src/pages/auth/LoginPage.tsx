import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Field, Input } from '../../components/ui/forms';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/toast';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export function LoginPage() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      await signIn(values.email, values.password);
      toast({ title: 'Welcome back', type: 'success' });
      navigate('/dashboard');
    } catch (error) {
      toast({ title: 'Login failed', description: error instanceof Error ? error.message : 'Please check your credentials.', type: 'error' });
    }
  }

  return (
    <AuthFrame title="Sign in to BuildWise AI" subtitle="Plan budgets, compare builders, and manage construction decisions.">
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input type="email" {...form.register('email')} />
        </Field>
        <Field label="Password" error={form.formState.errors.password?.message}>
          <Input type="password" {...form.register('password')} />
        </Field>
        <Button loading={form.formState.isSubmitting}>Sign in</Button>
      </form>
      <div className="mt-5 flex items-center justify-between text-sm">
        <Link className="font-semibold text-primary" to="/forgot-password">
          Forgot password?
        </Link>
        <Link className="font-semibold text-primary" to="/signup">
          Create account
        </Link>
      </div>
    </AuthFrame>
  );
}

export function AuthFrame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.18),transparent_34%),linear-gradient(135deg,hsl(var(--background)),hsl(var(--muted)))] p-4">
      <section className="glass-panel w-full max-w-md rounded-xl p-6">
        <Link to="/" className="mb-6 flex items-center gap-2 font-bold">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </span>
          BuildWise AI
        </Link>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mb-6 mt-2 text-sm text-muted-foreground">{subtitle}</p>
        {children}
      </section>
    </main>
  );
}
