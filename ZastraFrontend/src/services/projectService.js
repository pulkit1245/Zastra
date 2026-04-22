import api from './api';

export const projectService = {
  getProjects: () => api.get('/api/v1/projects'),
  createProject: (data) => api.post('/api/v1/projects', data),
  updateProject: (id, data) => api.put(`/api/v1/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/api/v1/projects/${id}`),
};
