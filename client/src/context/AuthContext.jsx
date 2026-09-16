import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        if (token === 'demo-preview-token') {
          const saved = localStorage.getItem('user');
          if (saved) setUser(JSON.parse(saved));
          setLoading(false);
          return;
        }
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        } catch (e) {
          const saved = localStorage.getItem('user');
          if (saved) {
            setUser(JSON.parse(saved));
          } else {
            console.error('Session validation failed');
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (usernameOrEmail, password) => {
    try {
      const res = await api.post('/auth/login', { username: usernameOrEmail, password });
      const { accessToken, refreshToken, user: userData } = res.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return userData;
    } catch (err) {
      // Demo fallback when backend API is unreachable on static Netlify preview
      const demoProfiles = {
        'partner@nrelango.in': {
          id: 'demo-partner',
          email: 'partner@nrelango.in',
          fullName: 'Adv. N.R. Elango (Senior Advocate)',
          role: 'PARTNER',
          firm: { name: 'NR Elango Law Associates' },
        },
        'associate@nrelango.in': {
          id: 'demo-associate',
          email: 'associate@nrelango.in',
          fullName: 'Adv. S. Manoharan',
          role: 'ASSOCIATE',
          firm: { name: 'NR Elango Law Associates' },
        },
        'client@nrelango.in': {
          id: 'demo-client',
          email: 'client@nrelango.in',
          fullName: 'K. Ramakrishnan (Chennai Super Infra)',
          role: 'CLIENT',
          firm: { name: 'NR Elango Law Associates' },
        },
      };

      if (demoProfiles[usernameOrEmail]) {
        const demoUser = demoProfiles[usernameOrEmail];
        const token = 'demo-preview-token';
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', token);
        localStorage.setItem('user', JSON.stringify(demoUser));
        setUser(demoUser);
        return demoUser;
      }

      throw err;
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (e) {
      console.error('Logout failed');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const hasRole = (roles = []) => {
    if (!user) return false;
    if (!roles.length) return true;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
