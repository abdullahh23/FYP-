import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { GuestRoute, ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { RoleSelectionPage } from './pages/auth/RoleSelectionPage';
import { LandingPage } from './pages/LandingPage';
import { DashboardRouter } from './pages/dashboard/DashboardRouter';
import { AccountStatusPage } from './pages/AccountStatusPage';
import { HomeownerResultsPage } from './pages/dashboard/HomeownerResultsPage';
import { ProductDetailsPage } from './pages/marketplace/ProductDetailsPage';
import { ContractorAvailableProjectsPage } from './pages/dashboard/ContractorAvailableProjectsPage';
import { ContractorMessagesPage } from './pages/dashboard/ContractorMessagesPage';
import { ContractorNotificationsPage } from './pages/dashboard/ContractorNotificationsPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/choose-role" element={<RoleSelectionPage />} />
      <Route path="/account-status" element={<AccountStatusPage />} />
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/dashboard/available-projects" element={<ProtectedRoute roles={['contractor']}><ContractorAvailableProjectsPage /></ProtectedRoute>} />
        <Route path="/dashboard/requests" element={<DashboardRouter />} />
        <Route path="/dashboard/quotes" element={<DashboardRouter />} />
        <Route path="/dashboard/messages" element={<ContractorMessagesPage />} />
        <Route path="/dashboard/notifications" element={<ContractorNotificationsPage />} />
        <Route path="/dashboard/profile" element={<DashboardRouter />} />
        <Route path="/dashboard/settings" element={<DashboardRouter />} />
        <Route path="/dashboard/projects/:projectId/results" element={<ProtectedRoute roles={['homeowner']}><HomeownerResultsPage /></ProtectedRoute>} />
        <Route path="/marketplace/products/:productId" element={<ProductDetailsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
