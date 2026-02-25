import api from './api';

export const getDashboardSummary = async () => {
    const response = await api.get('/analytics/dashboard-summary');
    return response.data;
};
