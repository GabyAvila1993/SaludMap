import axios from 'axios';

class ReseniasService {
  constructor() {
    this.api = axios.create({
      baseURL:'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar el token a todas las peticiones
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Valida si el usuario puede dejar una reseña para un turno
   */
  async validarPuedeReseniar(turnoId) {
    try {
      const response = await this.api.get(`/resenias/validar/${turnoId}`);
      return response.data;
    } catch (error) {
      console.error('Error validando reseña:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva reseña
   */
  async crearResenia(turnoId, establecimientoId, puntuacion, comentario) {
    try {
      const response = await this.api.post(
        '/resenias',
        {
          turnoId,
          establecimientoId,
          puntuacion,
          comentario,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creando reseña:', error);
      throw error;
    }
  }

  /**
   * Obtiene las reseñas de un establecimiento
   */
  async obtenerResenias(establecimientoId) {
    try {
      const response = await this.api.get(`/resenias/establecimiento/${establecimientoId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo reseñas:', error);
      return [];
    }
  }

  /**
   * Obtiene las reseñas del usuario autenticado
   */
  async misResenias() {
    try {
      const response = await this.api.get('/resenias/mis-resenias');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo mis reseñas:', error);
      return [];
    }
  }

  /**
   * Obtiene los turnos que el usuario puede reseñar
   */
  async getTurnosParaReseniar(establecimientoId) {
    try {
      const response = await this.api.get(`/resenias/turnos-para-reseniar`, {
        params: { establecimientoId }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener turnos:', error);
      throw error;
    }
  }

  /**
   * Obtiene una reseña específica
   */
  async obtenerResenia(id) {
    try {
      const response = await this.api.get(`/resenias/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo reseña:', error);
      throw error;
    }
  }
}

const reseniasService = new ReseniasService();
export default reseniasService;