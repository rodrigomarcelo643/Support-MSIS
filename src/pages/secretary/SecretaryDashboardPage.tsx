import React from 'react';
import { RoleDashboardView } from '../../components/dashboard/RoleDashboardView';

export const SecretaryDashboardPage: React.FC = () => {
  return <RoleDashboardView currentRole="Secretary" roleSlug="secretary" />;
};

export default SecretaryDashboardPage;
