import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile, UserRole } from '../types';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  chooseRole: (role: Exclude<UserRole, 'admin'>, city?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(user: User | null) {
  if (!user) return null;
  const { data, error } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
  if (error) throw error;
  if (data) return data as Profile;

  const { data: inserted, error: insertError } = await supabase
    .from('users')
    .insert({
      id: user.id,
      email: user.email ?? '',
      name: user.user_metadata?.name ?? null,
      phone: user.user_metadata?.phone ?? null
    })
    .select()
    .single();
  if (insertError) throw insertError;
  return inserted as Profile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    const current = await supabase.auth.getUser();
    setProfile(await fetchProfile(current.data.user));
  };

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setProfile(await fetchProfile(data.session?.user ?? null));
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      fetchProfile(nextSession?.user ?? null)
        .then(setProfile)
        .finally(() => setLoading(false));
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      isAdmin: profile?.role === 'admin',
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      async signUp(input) {
        const { data, error } = await supabase.auth.signUp({
          email: input.email,
          password: input.password,
          options: {
            emailRedirectTo: `${window.location.origin}/choose-role`,
            data: { name: input.name, phone: input.phone }
          }
        });
        if (error) throw error;
        if (!data.user) throw new Error('Supabase did not create an Auth user. Please try again.');
      },
      async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setProfile(null);
      },
      async chooseRole(role, city) {
        if (!session?.user) throw new Error('Please sign in before choosing a role.');
        if (profile?.role) throw new Error('Role has already been selected for this account.');
        const { error } = await supabase
          .from('users')
          .update({ role, city: city || profile?.city || null })
          .eq('id', session.user.id)
          .is('role', null);
        if (error) throw error;
        await refreshProfile();
      },
      refreshProfile
    }),
    [loading, profile, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
