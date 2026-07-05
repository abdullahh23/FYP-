import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';

export function LoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-background">
      <div className="flex items-center gap-3 rounded-xl border bg-card px-5 py-4 shadow-panel">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="font-semibold">Loading BuildWise AI</span>
      </div>
    </main>
  );
}

export function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: UserRole[] }) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!profile?.role) return <Navigate to="/choose-role" replace />;
  if (profile.account_status !== 'active') return <Navigate to="/account-status" replace />;
  if (roles && !roles.includes(profile.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { session, profile, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (session && !profile?.role) return <Navigate to="/choose-role" replace />;
  if (session) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
