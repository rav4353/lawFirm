import api from './api';

export const caseAnalyticsService = {
  getOverview: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const response = await api.get(`/analytics/case-performance?${params.toString()}`);
    return response.data;
  }
};
