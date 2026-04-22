import api from './api';

export const profileService = {
  getProfile: () => api.get('/api/v1/profile'),
  updateProfile: (data) => api.put('/api/v1/profile', data),
};
