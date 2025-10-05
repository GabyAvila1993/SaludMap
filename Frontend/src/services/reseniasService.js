import api from '../config/api';

class ReseniasService {
  /**
   * Valida si el usuario puede dejar una reseña para un turno
   */
  async validarPuedeReseniar(turnoId) {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/resenias/validar/${turnoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
      const token = localStorage.getItem('token');
      const response = await api.post(
        '/resenias',
        {
          turnoId,
          establecimientoId,
          puntuacion,
          comentario,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
      const response = await api.get(`/resenias/establecimiento/${establecimientoId}`);
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
      const token = localStorage.getItem('token');
      const response = await api.get('/resenias/mis-resenias', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo mis reseñas:', error);
      return [];
    }
  }

  /**
   * Obtiene los turnos que el usuario puede reseñar
   */
  async getTurnosParaReseniar(establecimientoId = null) {
    try {
      const token = localStorage.getItem('token');
      const url = establecimientoId
        ? `/resenias/turnos-para-reseniar?establecimientoId=${establecimientoId}`
        : '/resenias/turnos-para-reseniar';
      
      const response = await api.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo turnos para reseñar:', error);
      return [];
    }
  }

  /**
   * Obtiene una reseña específica
   */
  async obtenerResenia(id) {
    try {
      const response = await api.get(`/resenias/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo reseña:', error);
      throw error;
    }
  }
}

const reseniasService = new ReseniasService();
export default reseniasService;
