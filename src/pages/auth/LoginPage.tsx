import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Field, Input } from '../../components/ui/forms';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageToggle } from '../../components/ui/LanguageToggle';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export function LoginPage() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const { tx } = useLanguage();
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' }
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      await signIn(values.email, values.password);
      toast({ title: tx.auth.loginSuccess, type: 'success' });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: tx.auth.loginFailed,
        description: error instanceof Error ? error.message : undefined,
        type: 'error'
      });
    }
  }

  return (
    <AuthFrame title={tx.auth.loginTitle} subtitle={tx.auth.loginSubtitle}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Field label={tx.auth.email} error={form.formState.errors.email?.message}>
          <Input type="email" placeholder="name@example.com" {...form.register('email')} />
        </Field>
        <Field label={tx.auth.password} error={form.formState.errors.password?.message}>
          <Input type="password" placeholder="••••••••" {...form.register('password')} />
        </Field>
        <Button loading={form.formState.isSubmitting} className="w-full font-bold">
          {tx.signIn}
        </Button>
      </form>
      <div className="mt-5 flex items-center justify-between text-sm">
        <Link className="font-semibold text-primary hover:underline" to="/forgot-password">
          {tx.auth.forgotPasswordLink}
        </Link>
        <Link className="font-semibold text-primary hover:underline" to="/signup">
          {tx.auth.createAccountLink}
        </Link>
      </div>
    </AuthFrame>
  );
}

export function AuthFrame({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { tx } = useLanguage();

  return (
    <main className="relative grid min-h-screen place-items-center bg-background p-4"
      style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 39px, hsl(var(--border)) 39px, hsl(var(--border)) 40px),
          repeating-linear-gradient(90deg, transparent, transparent 39px, hsl(var(--border)) 39px, hsl(var(--border)) 40px)
        `,
        backgroundSize: '40px 40px'
      }}
    >
      <section className="relative w-full max-w-md border-2 border-foreground/15 bg-card shadow-[6px_6px_0px_hsl(var(--primary)/0.2)] p-6">
        {/* top rust accent bar */}
        <div className="absolute left-0 top-0 h-1 w-full bg-primary" />
        <div className="mb-7 mt-2 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-black text-base uppercase tracking-widest">
            <span className="grid h-9 w-9 place-items-center bg-primary text-primary-foreground">
              <Building2 className="h-4 w-4" />
            </span>
            <span>{tx.brandName}</span>
          </Link>
          <LanguageToggle />
        </div>
        <h1 className="text-3xl font-black tracking-tight leading-tight">{title}</h1>
        <p className="mb-7 mt-2 text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
        {children}
      </section>
    </main>
  );
}
