import api from './api';

export const activityService = {
  getGlobalStats: () => api.get('/api/v1/activity/global'),
  getGithubStats: () => api.get('/api/v1/activity/github'),
  getContestStats: () => api.get('/api/v1/activity/contest'),
  getHeatmap: () => api.get('/api/v1/activity/heatmap'),
};
