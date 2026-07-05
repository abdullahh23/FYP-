import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/button';
import { Field, Input } from '../../components/ui/forms';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/toast';
import { AuthFrame } from './LoginPage';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email(),
  phone: z.string().min(7, 'Phone is required'),
  password: z.string().min(8, 'Use at least 8 characters')
});

export function SignupPage() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', phone: '', password: '' } });

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      await signUp(values);
      toast({ title: 'Check your inbox', description: 'Verify your email, then sign in and choose your BuildWise role.', type: 'success' });
    } catch (error) {
      toast({ title: 'Signup failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    }
  }

  return (
    <AuthFrame title="Create your BuildWise account" subtitle="Your role is selected after your first verified login.">
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Field label="Full name" error={form.formState.errors.name?.message}>
          <Input {...form.register('name')} />
        </Field>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input type="email" {...form.register('email')} />
        </Field>
        <Field label="Phone" error={form.formState.errors.phone?.message}>
          <Input {...form.register('phone')} />
        </Field>
        <Field label="Password" error={form.formState.errors.password?.message}>
          <Input type="password" {...form.register('password')} />
        </Field>
        <Button loading={form.formState.isSubmitting}>Create account</Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already registered?{' '}
        <Link className="font-semibold text-primary" to="/login">
          Sign in
        </Link>
      </p>
    </AuthFrame>
  );
}
