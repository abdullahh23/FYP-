import { Navigate, useNavigate } from 'react-router-dom';
import { Building2, Hammer, Home, Package } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Field, Select } from '../../components/ui/forms';
import { Card } from '../../components/ui/card';
import { cityOptions } from '../../lib/constants';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/toast';
import type { UserRole } from '../../types';

const roleCards = [
  { role: 'homeowner', title: 'Homeowner', icon: Home, text: 'Create projects, estimate budgets, compare quotations, and chat with contractors.' },
  { role: 'contractor', title: 'Contractor / Builder', icon: Hammer, text: 'Receive verified homeowner requests, submit quotations, and manage project conversations.' },
  { role: 'supplier', title: 'Material Supplier', icon: Package, text: 'Manage products and launch relevant promotions for active construction projects.' }
] as const;

export function RoleSelectionPage() {
  const { session, profile, chooseRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState<Exclude<UserRole, 'admin'> | null>(null);
  const [city, setCity] = useState('Lahore');
  const [saving, setSaving] = useState(false);

  if (!session) return <Navigate to="/login" replace />;
  if (profile?.role) return <Navigate to="/dashboard" replace />;

  async function save() {
    if (!role) return;
    try {
      setSaving(true);
      await chooseRole(role, city);
      toast({ title: 'Role saved', description: 'Your BuildWise workspace is ready.', type: 'success' });
      navigate('/dashboard');
    } catch (error) {
      toast({ title: 'Could not save role', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.18),transparent_35%),hsl(var(--background))] p-4">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center py-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold">BuildWise AI</p>
            <p className="text-sm text-muted-foreground">Choose your permanent MVP role.</p>
          </div>
        </div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">How will you use BuildWise?</h1>
          <p className="mt-2 text-muted-foreground">Select exactly one role. Contractor and supplier public visibility remains locked until future admin verification.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {roleCards.map((item) => (
            <Card
              key={item.role}
              role="button"
              tabIndex={0}
              onClick={() => setRole(item.role)}
              className={`cursor-pointer p-5 ${role === item.role ? 'border-primary ring-2 ring-primary' : 'hover:border-primary/50'}`}
            >
              <item.icon className="h-8 w-8 text-primary" />
              <h2 className="mt-4 text-lg font-bold">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
            </Card>
          ))}
        </div>
        <div className="mt-6 grid gap-4 rounded-xl border bg-card p-5 md:grid-cols-[1fr_auto] md:items-end">
          <Field label="Primary city">
            <Select value={city} onChange={(event) => setCity(event.target.value)}>
              {cityOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>
          </Field>
          <Button onClick={save} disabled={!role} loading={saving}>
            Continue
          </Button>
        </div>
      </section>
    </main>
  );
}
