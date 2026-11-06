import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RoleRedirect: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'Admin';

  const slug = role === 'Super Admin' ? 'super-admin' : role.toLowerCase();
  return <Navigate to={`/${slug}/dashboard`} replace />;
};

export default RoleRedirect;
