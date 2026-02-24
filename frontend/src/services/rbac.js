import api from "./api";

export const rbacService = {
  async listRoles() {
    const response = await api.get("/rbac/roles");
    return response.data;
  },

  async listPermissions() {
    const response = await api.get("/rbac/permissions");
    return response.data;
  },

  async getRolePermissions(roleId) {
    const response = await api.get(`/rbac/roles/${roleId}/permissions`);
    return response.data;
  },

  async updateRolePermissions(roleId, permissions) {
    const response = await api.put(`/rbac/roles/${roleId}/permissions`, {
      permissions,
    });
    return response.data;
  },
};
