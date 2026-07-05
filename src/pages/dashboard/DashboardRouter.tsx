import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { HomeownerDashboard } from './HomeownerDashboard';
import { ContractorDashboard } from './ContractorDashboard';
import { SupplierDashboard } from './SupplierDashboard';

/**
 * DashboardRouter renders the appropriate dashboard based on the user's role.
 * No sub-routing needed — each dashboard manages its own internal sections via state.
 */
export function DashboardRouter() {
  const { profile } = useAuth();

  if (!profile) return <Navigate to="/choose-role" replace />;

  switch (profile.role) {
    case 'homeowner':
      return <HomeownerDashboard />;
    case 'contractor':
      return <ContractorDashboard />;
    case 'supplier':
      return <SupplierDashboard />;
    default:
      return <Navigate to="/choose-role" replace />;
  }
}
