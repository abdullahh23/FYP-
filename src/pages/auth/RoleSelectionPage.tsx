import { Navigate, useNavigate } from 'react-router-dom';
import { Building2, Hammer, Home, Package } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Field, Select } from '../../components/ui/forms';
import { Card } from '../../components/ui/card';
import { cityOptions } from '../../lib/constants';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageToggle } from '../../components/ui/LanguageToggle';
import type { UserRole } from '../../types';

export function RoleSelectionPage() {
  const { session, profile, chooseRole } = useAuth();
  const { toast } = useToast();
  const { tx, isUrdu } = useLanguage();
  const navigate = useNavigate();
  const [role, setRole] = useState<Exclude<UserRole, 'admin'> | null>(null);
  const [city, setCity] = useState('Lahore');
  const [saving, setSaving] = useState(false);

  if (!session) return <Navigate to="/login" replace />;
  if (profile?.role) return <Navigate to="/dashboard" replace />;

  const roleCards = [
    {
      role: 'homeowner' as const,
      title: tx.roles.homeowner,
      icon: Home,
      text: isUrdu
        ? 'اپنا گھر بنائیں، اے آئی تخمینہ لگائیں، ٹھیکیداروں کا موازنہ کریں اور براہ راست کوٹیشنز حاصل کریں۔'
        : 'Create projects, estimate budgets, compare quotations, and chat with contractors.'
    },
    {
      role: 'contractor' as const,
      title: tx.roles.contractor,
      icon: Hammer,
      text: isUrdu
        ? 'کلائنٹس کے پروجیکٹس وصول کریں، ریٹس اور کوٹیشنز جمع کروائیں اور تعمیراتی سائٹس کی نگرانی کریں۔'
        : 'Receive homeowner requests, submit quotations, and manage project conversations.'
    },
    {
      role: 'supplier' as const,
      title: tx.roles.supplier,
      icon: Package,
      text: isUrdu
        ? 'تعمیراتی میٹریل (سیمنٹ، سریہ، ٹائلز وغیرہ) لسٹ کریں اور جاری پروجیکٹس کو سامان فراہم کریں۔'
        : 'Manage products and launch relevant promotions for active construction projects.'
    }
  ];

  async function save() {
    if (!role) return;
    try {
      setSaving(true);
      await chooseRole(role, city);
      toast({ title: tx.success, description: tx.auth.signupSuccess, type: 'success' });
      navigate('/dashboard');
    } catch (error) {
      toast({ title: 'Could not save role', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_35%),hsl(var(--background))] p-4">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center py-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <p className="font-extrabold text-lg tracking-tight">{tx.brandName}</p>
              <p className="text-sm text-muted-foreground">{tx.auth.chooseRoleSubtitle}</p>
            </div>
          </div>
          <LanguageToggle />
        </div>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{tx.auth.chooseRoleTitle}</h1>
          <p className="mt-2 text-muted-foreground">{tx.auth.selectRolePrompt}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {roleCards.map((item) => (
            <Card
              key={item.role}
              role="button"
              tabIndex={0}
              onClick={() => setRole(item.role)}
              className={`cursor-pointer p-6 transition-all duration-200 ${
                role === item.role
                  ? 'border-emerald-600 ring-2 ring-emerald-600 bg-emerald-50/20 shadow-md'
                  : 'hover:border-primary/50'
              }`}
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary mb-4">
                <item.icon className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.text}</p>
            </Card>
          ))}
        </div>

        <div className="mt-6 grid gap-4 rounded-xl border bg-card p-5 shadow-sm md:grid-cols-[1fr_auto] md:items-end">
          <Field label={tx.auth.primaryCity}>
            <Select value={city} onChange={(event) => setCity(event.target.value)}>
              {cityOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>
          </Field>
          <Button disabled={!role} loading={saving} onClick={save} className="font-bold px-6">
            {tx.auth.confirmRole}
          </Button>
        </div>
      </section>
    </main>
  );
}
