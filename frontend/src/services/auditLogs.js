import api from './api';

export const auditLogsService = {
  async list({ limit = 50, offset = 0, resource, action, resource_id } = {}) {
    const params = {
      limit,
      offset,
    };
    if (resource) params.resource = resource;
    if (action) params.action = action;
    if (resource_id) params.resource_id = resource_id;

    const response = await api.get('/audit-logs', { params });
    return response.data;
  },
};
