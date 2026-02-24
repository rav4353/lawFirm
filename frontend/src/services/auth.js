import api from './api';

export const authService = {
  async register(email, password) {
    // Role is NOT sent — backend always assigns "paralegal"
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },

  async login(email, password) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token } = response.data;
    localStorage.setItem('access_token', access_token);
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },
};
