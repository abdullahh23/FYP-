import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

export function AccountStatusPage() {
  const { profile, signOut } = useAuth();
  return (
    <main className="grid min-h-screen place-items-center bg-background p-4">
      <section className="glass-panel max-w-md rounded-xl p-6 text-center">
        <h1 className="text-2xl font-bold">Account needs review</h1>
        <p className="mt-2 text-muted-foreground">Your account status is {profile?.account_status}. Please contact the platform administrator when admin workflows are available.</p>
        <Button className="mt-5" onClick={signOut}>Sign out</Button>
      </section>
    </main>
  );
}
