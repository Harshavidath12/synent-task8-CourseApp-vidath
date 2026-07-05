import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('userInfo');
      
      if (token && userInfo) {
        try {
          // Verify token by fetching profile
          const res = await api.get('/users/profile');
          setUser({ ...JSON.parse(userInfo), ...res.data.user });
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('userInfo', JSON.stringify({
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'user'
    }));
  };

  const adminLogin = (adminData) => {
    setUser({ ...adminData, role: 'admin' });
    localStorage.setItem('token', adminData.token);
    localStorage.setItem('userInfo', JSON.stringify({
      _id: adminData._id,
      username: adminData.username,
      role: 'admin'
    }));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ user, login, adminLogin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
