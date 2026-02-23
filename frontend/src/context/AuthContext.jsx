import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';
import { permissionsService } from '../services/permissions';
import { AuthContext } from './AuthContextDef';


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);

  const fetchPermissions = useCallback(async () => {
    try {
      const data = await permissionsService.fetchPermissions();
      setPermissions(data.permissions || []);
    } catch {
      setPermissions([]);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setUser(null);
      setPermissions([]);
      setLoading(false);
      return;
    }
    try {
      const userData = await authService.getMe();
      setUser(userData);
      await fetchPermissions();
    } catch {
      setUser(null);
      setPermissions([]);
      authService.logout();
    } finally {
      setLoading(false);
    }
  }, [fetchPermissions]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    await authService.login(email, password);
    await fetchUser();
  };

  const register = async (email, password, role) => {
    const newUser = await authService.register(email, password, role);
    return newUser;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setPermissions([]);
  };

  const hasPermission = (resource, action) => {
    return permissions.some(
      (p) => p.resource === resource && p.action === action
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        permissions,
        login,
        register,
        logout,
        hasPermission,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
