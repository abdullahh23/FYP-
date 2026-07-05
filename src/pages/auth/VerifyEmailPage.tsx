import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { AuthFrame } from './LoginPage';

export function VerifyEmailPage() {
  return (
    <AuthFrame title="Verify your email" subtitle="Supabase sends a verification link before role selection is available.">
      <div className="rounded-xl border bg-muted p-5 text-center">
        <MailCheck className="mx-auto h-10 w-10 text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">After verification, sign in and BuildWise will ask you to choose exactly one role.</p>
      </div>
      <Link className="mt-5 block text-center text-sm font-semibold text-primary" to="/login">
        Go to sign in
      </Link>
    </AuthFrame>
  );
}
