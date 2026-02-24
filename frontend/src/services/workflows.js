import api from './api';

export const workflowService = {
  async list() {
    const response = await api.get('/workflows');
    return response.data;
  },

  async get(id) {
    const response = await api.get(`/workflows/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/workflows', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/workflows/${id}`, data);
    return response.data;
  },

  async remove(id) {
    await api.delete(`/workflows/${id}`);
  },

  async execute(id, file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/workflows/${id}/execute`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
