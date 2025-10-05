import axios from 'axios';

// Configuración de API para diferentes entornos
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3000/api',
  },
  production: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://tu-backend.onrender.com/api',
  }
};

// Detectar entorno actual
const environment = import.meta.env.MODE || 'development';

// Exportar configuración actual
export const apiConfig = API_CONFIG[environment];

// Crear instancia de axios configurada
const api = axios.create({
  baseURL: apiConfig.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper para construir URLs de endpoints
export const buildApiUrl = (endpoint) => {
  return `${apiConfig.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Endpoints disponibles
export const API_ENDPOINTS = {
  // Usuarios
  USERS: '/usuarios',
  USER_LOGIN: '/usuarios/login',
  USER_REGISTER: '/usuarios/register',
  
  // Lugares/Centros médicos
  PLACES: '/places',
  PLACES_NEARBY: '/places/nearby',
  
  // Turnos médicos
  TURNOS: '/turnos',
  TURNOS_CREATE: '/turnos/create',
  TURNOS_USER: '/turnos/user',
  
  // Reseñas
  RESENIAS: '/resenias',
  RESENIAS_VALIDAR: '/resenias/validar',
  RESENIAS_ESTABLECIMIENTO: '/resenias/establecimiento',
  RESENIAS_MIS_RESENIAS: '/resenias/mis-resenias',
  RESENIAS_TURNOS_PARA_RESENIAR: '/resenias/turnos-para-reseniar',
  
  // Otros endpoints que puedas tener
  HEALTH_CHECK: '/health'
};

export default api;
