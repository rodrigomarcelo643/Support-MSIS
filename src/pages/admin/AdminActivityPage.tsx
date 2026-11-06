import React from 'react';
import { ActivityFeedView } from '../../components/dashboard/ActivityFeedView';

export const AdminActivityPage: React.FC = () => {
  return <ActivityFeedView currentRole="Admin" />;
};

export default AdminActivityPage;
