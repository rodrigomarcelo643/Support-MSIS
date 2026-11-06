import React from 'react';
import { ActivityFeedView } from '../../components/dashboard/ActivityFeedView';

export const SecretaryActivityPage: React.FC = () => {
  return <ActivityFeedView currentRole="Secretary" />;
};

export default SecretaryActivityPage;
