import React from 'react';
import { ActivityFeedView } from '../../components/dashboard/ActivityFeedView';

export const StudentActivityPage: React.FC = () => {
  return <ActivityFeedView currentRole="Student" />;
};

export default StudentActivityPage;
