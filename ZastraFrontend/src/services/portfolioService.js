import api from './api';

export const portfolioService = {
  getPublicPortfolio: (username) => api.get(`/api/v1/portfolio/public/${username}`),
  getDirectory: () => api.get('/api/v1/portfolio/directory'),
};
