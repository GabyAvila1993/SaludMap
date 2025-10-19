// Servicio para hacer requests al backend
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js';

class ApiService {
  constructor() {
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Método genérico para hacer requests
  async request(endpoint, options = {}) {
    const url = buildApiUrl(endpoint);
    
    const config = {
      // merge options first, then ensure headers include defaults + any provided headers
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...(options && options.headers ? options.headers : {}),
      },
    };

    try {
      console.log(`[API] ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`[API] Response:`, data);
      
      return data;
    } catch (error) {
      console.error(`[API] Error en ${url}:`, error);
      throw error;
    }
  }

  // Métodos específicos para cada endpoint
  
  // Health check
  async healthCheck() {
    return this.request(API_ENDPOINTS.HEALTH_CHECK);
  }

  // Usuarios
  async getUsers() {
    return this.request(API_ENDPOINTS.USERS);
  }

  async loginUser(credentials) {
    return this.request(API_ENDPOINTS.USER_LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async registerUser(userData) {
    return this.request(API_ENDPOINTS.USER_REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Lugares/Centros médicos
  async getPlaces() {
    return this.request(API_ENDPOINTS.PLACES);
  }

  async getNearbyPlaces(lat, lng, radius = 5000) {
    return this.request(`${API_ENDPOINTS.PLACES_NEARBY}?lat=${lat}&lng=${lng}&radius=${radius}`);
  }

  async createPlace(placeData) {
    return this.request(API_ENDPOINTS.PLACES, {
      method: 'POST',
      body: JSON.stringify(placeData),
    });
  }

  // Turnos médicos
  async getTurnos() {
    return this.request(API_ENDPOINTS.TURNOS);
  }

  async createTurno(turnoData) {
    return this.request(API_ENDPOINTS.TURNOS_CREATE, {
      method: 'POST',
      body: JSON.stringify(turnoData),
    });
  }

  async getUserTurnos(userId) {
    return this.request(`${API_ENDPOINTS.TURNOS_USER}/${userId}`);
  }

  async updateTurno(turnoId, turnoData) {
    return this.request(`${API_ENDPOINTS.TURNOS}/${turnoId}`, {
      method: 'PUT',
      body: JSON.stringify(turnoData),
    });
  }

  async deleteTurno(turnoId) {
    return this.request(`${API_ENDPOINTS.TURNOS}/${turnoId}`, {
      method: 'DELETE',
    });
  }
}

// Exportar instancia singleton
export const apiService = new ApiService();
export default apiService;
