import React from 'react';
import { RoleDashboardView } from '../../components/dashboard/RoleDashboardView';

export const FacultyDashboardPage: React.FC = () => {
  return <RoleDashboardView currentRole="Faculty" roleSlug="faculty" />;
};

export default FacultyDashboardPage;
