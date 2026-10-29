import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api/authApi.js';
import { socketService } from '../services/socket/socketService.js';
import { queryClient } from '../lib/queryClient.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const response = await authApi.getMe();
        if (mounted && response?.data) {
          setUser(response.data);
          socketService.connect();
        }
      } catch (err) {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authApi.login(credentials);
    const loggedUser = response.data.user;
    setUser(loggedUser);
    socketService.connect(response.data.token);
    queryClient.invalidateQueries();
    return response.data;
  }, []);

  const register = useCallback(async (data) => {
    const response = await authApi.register(data);
    const registeredUser = response.data.user;
    setUser(registeredUser);
    socketService.connect(response.data.token);
    queryClient.invalidateQueries();
    return response.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Continue client cleanup even if network fails
    } finally {
      setUser(null);
      socketService.disconnect();
      queryClient.clear();
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    const response = await authApi.updateProfile(data);
    setUser((prev) => ({ ...prev, ...response.data }));
    return response.data;
  }, []);

  const updateUser = useCallback((userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
