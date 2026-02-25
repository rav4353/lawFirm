import api from "./api";

export const usersService = {
  async list() {
    const response = await api.get("/users");
    return response.data;
  },

  async create(data) {
    const response = await api.post("/users", data);
    return response.data;
  },

  async update(userId, data) {
    const response = await api.patch(`/users/${userId}`, data);
    return response.data;
  },

  async deactivate(userId) {
    const response = await api.patch(`/users/${userId}/deactivate`);
    return response.data;
  },

  async activate(userId) {
    const response = await api.patch(`/users/${userId}/activate`);
    return response.data;
  },
  
  async delete(userId) {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
};
