import api from './api';

export const gamificationService = {
  getSummary: () => api.get('/api/v1/gamification/summary'),
  getLeaderboard: () => api.get('/api/v1/gamification/leaderboard'),
};
