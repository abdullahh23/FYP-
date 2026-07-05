import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * RequireRole component renders its children only if the logged‑in user has one of the allowedRoles.
 * Otherwise redirects to the role‑selection page.
 */
export const RequireRole = ({
  allowedRoles,
  children,
}: {
  allowedRoles: string[];
  children: React.ReactNode;
}) => {
  const navigate = useNavigate();
  const { profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && profile && !allowedRoles.includes(profile.role as string)) {
      navigate('/choose-role', { replace: true });
    }
  }, [loading, profile, allowedRoles, navigate]);

  if (loading) return null;
  if (!profile) return null;
  return allowedRoles.includes(profile.role as string) ? <>{children}</> : null;
};
