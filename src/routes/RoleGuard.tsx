import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { user } = useAuth();

  const userRole = (user?.role || 'Admin') as UserRole;

  if (!allowedRoles.includes(userRole)) {
    // Redirect to user's assigned role dashboard
    const userSlug =
      userRole === 'Super Admin' ? 'super-admin' : userRole.toLowerCase();
    return <Navigate to={`/${userSlug}/dashboard`} replace />;
  }

  return <Outlet />;
};

export default RoleGuard;
