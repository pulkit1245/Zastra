import api from './api';

export const integrationService = {
  getStatuses: () => api.get('/api/v1/integrations'),
  syncPlatform: (platform, data) => api.post(`/api/v1/integrations/${platform}/sync`, data),
  syncAll: () => api.post('/api/v1/integrations/sync-all'),
};
