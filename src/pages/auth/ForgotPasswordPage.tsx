import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { AuthFrame } from './LoginPage';
import { Field, Input } from '../../components/ui/forms';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/toast';

const schema = z.object({ email: z.string().email() });

export function ForgotPasswordPage() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  async function onSubmit(values: z.infer<typeof schema>) {
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, { redirectTo: `${window.location.origin}/login` });
    if (error) toast({ title: 'Could not send reset link', description: error.message, type: 'error' });
    else toast({ title: 'Reset link sent', description: 'Please check your email.', type: 'success' });
  }

  return (
    <AuthFrame title="Reset your password" subtitle="We will email a secure reset link if the account exists.">
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input type="email" {...form.register('email')} />
        </Field>
        <Button loading={form.formState.isSubmitting}>Send reset link</Button>
      </form>
      <Link className="mt-5 block text-center text-sm font-semibold text-primary" to="/login">
        Back to sign in
      </Link>
    </AuthFrame>
  );
}
