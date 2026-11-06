import React from 'react';
import { RoleDashboardView } from '../../components/dashboard/RoleDashboardView';

export const AdminDashboardPage: React.FC = () => {
  return <RoleDashboardView currentRole="Admin" roleSlug="admin" />;
};

export default AdminDashboardPage;
