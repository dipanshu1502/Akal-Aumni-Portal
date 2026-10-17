import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [token, setToken] = useState(localStorage.getItem('akal_token') || null);
  const [loading, setLoading] = useState(true);

  // Demo accounts for fast testing
  const demoAccounts = [
    { role: 'superadmin', label: 'Super Admin', email: 'superadmin@akaluniversity.ac.in', pass: 'Admin@12345' },
    { role: 'admin', label: 'Alumni Admin', email: 'admin@akaluniversity.ac.in', pass: 'Admin@12345' },
    { role: 'alumni', label: 'Verified Alumni (Google)', email: 'harpreet.tech@gmail.com', pass: 'Alumni@12345' },
    { role: 'student', label: 'CS Student (Dipanshu)', email: 'student@akaluniversity.ac.in', pass: 'Student@12345' },
  ];

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('akal_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.status && res.data) {
            setUser(res.data.user);
            setProfile(res.data.profile);
            setPermissions(res.data.permissions || {});
          }
        } catch (err) {
          console.error('Session restore failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.status && res.data) {
        const { token: newToken, user: userData, profile: profileData, permissions: perms } = res.data;
        setToken(newToken);
        setUser(userData);
        setProfile(profileData);
        setPermissions(perms || {});
        localStorage.setItem('akal_token', newToken);
        localStorage.setItem('akal_user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Invalid credentials' };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.status && res.data) {
        const { token: newToken, user: userData } = res.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('akal_token', newToken);
        localStorage.setItem('akal_user', JSON.stringify(userData));
        return { success: true, message: res.message, user: userData };
      }
      return { success: false, message: res.message || 'Registration failed', errors: res.errors || [] };
    } catch (err) {
      return { success: false, message: err.message || 'Registration error', errors: err.errors || [] };
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    setPermissions({});
    setToken(null);
    localStorage.removeItem('akal_token');
    localStorage.removeItem('akal_user');
  };

  const quickDemoLogin = async (demoEmail, demoPass) => {
    setLoading(true);
    const result = await login(demoEmail, demoPass);
    setLoading(false);
    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        permissions,
        token,
        loading,
        login,
        register,
        logout,
        quickDemoLogin,
        demoAccounts,
        isAuthenticated: !!user,
        isSuperAdmin: user?.role === 'superadmin',
        isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
        isAlumni: user?.role === 'alumni',
        isStudent: user?.role === 'student',
        isVerifiedAlumni: user?.role === 'alumni' && user?.verification_status === 'verified',
        hasPermission: (perm) => {
          if (!user) return false;
          if (user.role === 'superadmin') return true;
          if (user.role !== 'admin') return false;
          return !!(permissions && permissions[perm]);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
