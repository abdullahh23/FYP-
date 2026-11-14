import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/button';
import { Field, Input } from '../../components/ui/forms';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { AuthFrame } from './LoginPage';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(7, 'Phone number is required'),
  password: z.string().min(8, 'Use at least 8 characters')
});

export function SignupPage() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const { tx } = useLanguage();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', password: '' }
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      await signUp(values);
      toast({
        title: tx.auth.signupSuccess,
        description: 'Verify your email, then sign in and choose your BuildWise role.',
        type: 'success'
      });
    } catch (error) {
      toast({
        title: 'Signup failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        type: 'error'
      });
    }
  }

  return (
    <AuthFrame title={tx.auth.signupTitle} subtitle={tx.auth.signupSubtitle}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Field label={tx.auth.fullName} error={form.formState.errors.name?.message}>
          <Input placeholder="Muhammad Ali" {...form.register('name')} />
        </Field>
        <Field label={tx.auth.email} error={form.formState.errors.email?.message}>
          <Input type="email" placeholder="name@example.com" {...form.register('email')} />
        </Field>
        <Field label={tx.auth.phone} error={form.formState.errors.phone?.message}>
          <Input placeholder="0300-1234567" {...form.register('phone')} />
        </Field>
        <Field label={tx.auth.password} error={form.formState.errors.password?.message}>
          <Input type="password" placeholder="••••••••" {...form.register('password')} />
        </Field>
        <Button loading={form.formState.isSubmitting} className="w-full font-bold">
          {tx.signUp}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        {tx.auth.haveAccountLink.split('?')[0]}?{' '}
        <Link className="font-semibold text-primary hover:underline" to="/login">
          {tx.signIn}
        </Link>
      </p>
    </AuthFrame>
  );
}
