import React from 'react';
import { ActivityFeedView } from '../../components/dashboard/ActivityFeedView';

export const SuperAdminActivityPage: React.FC = () => {
  return <ActivityFeedView currentRole="Super Admin" />;
};

export default SuperAdminActivityPage;
