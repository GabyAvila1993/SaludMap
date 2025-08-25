import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from './services/authService.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario desde localStorage o API
    const stored = localStorage.getItem('saludmap_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  // Nuevo login real
  const login = async ({ mail, contrasenia }) => {
    const userData = await authService.login({ mail, contrasenia });
    setUser(userData);
    localStorage.setItem('saludmap_user', JSON.stringify(userData));
  };

  // Nuevo registro real
  const register = async ({ nombre, apellido, mail, contrasenia }) => {
    const userData = await authService.register({ nombre, apellido, mail, contrasenia });
    setUser(userData);
    localStorage.setItem('saludmap_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('saludmap_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
