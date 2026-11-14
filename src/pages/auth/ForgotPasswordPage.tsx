import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { AuthFrame } from './LoginPage';
import { Field, Input } from '../../components/ui/forms';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/toast';
import { useLanguage } from '../../contexts/LanguageContext';

const schema = z.object({ email: z.string().email() });

export function ForgotPasswordPage() {
  const { toast } = useToast();
  const { tx } = useLanguage();
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  async function onSubmit(values: z.infer<typeof schema>) {
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, { redirectTo: `${window.location.origin}/login` });
    if (error) {
      toast({ title: 'Error', description: error.message, type: 'error' });
    } else {
      toast({ title: tx.auth.resetLinkSent, type: 'success' });
    }
  }

  return (
    <AuthFrame title={tx.auth.forgotPasswordTitle} subtitle={tx.auth.forgotPasswordSubtitle}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Field label={tx.auth.email} error={form.formState.errors.email?.message}>
          <Input type="email" placeholder="name@example.com" {...form.register('email')} />
        </Field>
        <Button loading={form.formState.isSubmitting} className="w-full font-bold">
          {tx.auth.sendResetLink}
        </Button>
      </form>
      <Link className="mt-5 block text-center text-sm font-semibold text-primary hover:underline" to="/login">
        ← {tx.signIn}
      </Link>
    </AuthFrame>
  );
}
