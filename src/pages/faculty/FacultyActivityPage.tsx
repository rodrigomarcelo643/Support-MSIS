import React from 'react';
import { ActivityFeedView } from '../../components/dashboard/ActivityFeedView';

export const FacultyActivityPage: React.FC = () => {
  return <ActivityFeedView currentRole="Faculty" />;
};

export default FacultyActivityPage;
