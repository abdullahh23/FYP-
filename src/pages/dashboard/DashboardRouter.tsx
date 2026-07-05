import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { HomeownerDashboard } from './HomeownerDashboard';
import { ContractorDashboard } from './ContractorDashboard';
import { SupplierDashboard } from './SupplierDashboard';

export function DashboardRouter() {
  const { profile } = useAuth();
  if (profile?.role === 'homeowner') return <HomeownerDashboard />;
  if (profile?.role === 'contractor') return <ContractorDashboard />;
  if (profile?.role === 'supplier') return <SupplierDashboard />;
  return <Navigate to="/choose-role" replace />;
}
