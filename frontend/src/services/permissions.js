import api from './api';

export const permissionsService = {
  async fetchPermissions() {
    const response = await api.get('/auth/permissions');
    return response.data;
  },
};
