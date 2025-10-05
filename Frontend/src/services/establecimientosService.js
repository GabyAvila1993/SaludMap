import api from '../config/api';

/**
 * Servicio para manejar establecimientos de salud
 */
class EstablecimientosService {
  /**
   * Extrae datos relevantes de un lugar del mapa (OSM/Leaflet)
   */
  extractPlaceData(place) {
    const tags = place.tags || place.properties || {};
    
    // Obtener coordenadas
    const lat = place.lat || place.center?.lat || place.geometry?.coordinates?.[1];
    const lng = place.lng || place.center?.lon || place.geometry?.coordinates?.[0];

    // Obtener nombre
    const nombre = tags.name || tags.amenity || 'Establecimiento de salud';

    // Obtener tipo
    const tipo = tags.amenity || tags.healthcare || tags.shop || 'clinic';

    // Construir dirección
    const direccion = this.buildAddress(place);

    // Obtener teléfono
    const telefono = tags.phone || tags.telephone || tags['contact:phone'] || null;

    // Obtener horarios
    const horarios = tags.opening_hours || tags['opening_hours:covid'] || null;

    return {
      lat,
      lng,
      nombre,
      tipo,
      direccion,
      telefono,
      horarios,
      metadata: place, // Guardar todos los datos originales
    };
  }

  /**
   * Construye una dirección a partir de los datos del lugar
   */
  buildAddress(place) {
    const tags = place.tags || place.properties || {};
    
    // Intentar obtener dirección completa
    const fullAddress = tags.addr_full || tags['addr:full'] || tags.address;
    if (fullAddress) return String(fullAddress);

    // Construir desde componentes
    const street = tags['addr:street'] || tags.street;
    const number = tags['addr:housenumber'] || tags.housenumber;
    const city = tags['addr:city'] || tags.city || tags.town || tags.village;
    
    const parts = [];
    if (street) parts.push(street);
    if (number) parts.push(number);
    if (city && !parts.includes(city)) parts.push(city);
    
    if (parts.length) return parts.join(', ');

    // Fallback a coordenadas
    const lat = place.lat || place.center?.lat || place.geometry?.coordinates?.[1];
    const lng = place.lng || place.center?.lon || place.geometry?.coordinates?.[0];
    
    if (lat && lng) {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    return 'Dirección no disponible';
  }

  /**
   * Busca un establecimiento por coordenadas
   */
  async findByCoordinates(lat, lng) {
    try {
      const response = await api.get(`/establecimientos/coords/${lat}/${lng}`);
      return response.data?.found !== false ? response.data : null;
    } catch (error) {
      console.error('Error buscando establecimiento:', error);
      return null;
    }
  }

  /**
   * Busca o crea un establecimiento basado en datos del mapa
   */
  async findOrCreate(place) {
    try {
      const data = this.extractPlaceData(place);
      
      if (!data.lat || !data.lng) {
        throw new Error('Coordenadas inválidas');
      }

      // Buscar si existe
      let establecimiento = await this.findByCoordinates(data.lat, data.lng);
      
      // Si no existe, crearlo
      if (!establecimiento) {
        const response = await api.post('/establecimientos/find-or-create', data);
        establecimiento = response.data;
        console.log('Establecimiento creado:', establecimiento);
      } else {
        console.log('Establecimiento encontrado:', establecimiento);
      }

      return establecimiento;
    } catch (error) {
      console.error('Error en findOrCreate:', error);
      throw error;
    }
  }

  /**
   * Obtiene un establecimiento por ID
   */
  async findById(id) {
    try {
      const response = await api.get(`/establecimientos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo establecimiento:', error);
      throw error;
    }
  }

  /**
   * Obtiene las reseñas de un establecimiento
   */
  async getResenias(id) {
    try {
      const response = await api.get(`/establecimientos/${id}/resenias`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo reseñas del establecimiento:', error);
      return { resenias: [], estadisticas: { total: 0, promedioEstrellas: 0 } };
    }
  }

  /**
   * Lista todos los establecimientos
   */
  async findAll(skip = 0, take = 50) {
    try {
      const response = await api.get(`/establecimientos?skip=${skip}&take=${take}`);
      return response.data;
    } catch (error) {
      console.error('Error listando establecimientos:', error);
      return [];
    }
  }
}

const establecimientosService = new EstablecimientosService();
export default establecimientosService;
