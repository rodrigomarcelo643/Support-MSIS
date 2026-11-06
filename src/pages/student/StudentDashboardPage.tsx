import React from 'react';
import { RoleDashboardView } from '../../components/dashboard/RoleDashboardView';

export const StudentDashboardPage: React.FC = () => {
  return <RoleDashboardView currentRole="Student" roleSlug="student" />;
};

export default StudentDashboardPage;
