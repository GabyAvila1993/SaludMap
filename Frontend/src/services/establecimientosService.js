import api from '../config/api';

/**
 * Servicio para manejar establecimientos de salud
 */
class EstablecimientosService {
  /**
   * Extrae datos relevantes de un lugar del mapa (OSM/Leaflet)
   */
  extractPlaceData(place) {
    console.log('[EstablecimientosService] Extrayendo datos de place:', place);
    
    const tags = place.tags || place.properties || {};
    
    // Obtener coordenadas con múltiples fallbacks
    const lat = place.lat || place.center?.lat || place.geometry?.coordinates?.[1];
    const lng = place.lng || place.center?.lon || place.lon || place.geometry?.coordinates?.[0];

    if (!lat || !lng) {
      console.error('[EstablecimientosService] No se pudieron obtener coordenadas válidas');
      throw new Error('Coordenadas inválidas o no disponibles');
    }

    // Obtener nombre con fallbacks
    const nombre = tags.name || 
                   tags.amenity || 
                   place.name ||
                   place.properties?.name ||
                   'Establecimiento de salud';

    // Obtener tipo con fallbacks
    const tipo = tags.amenity || 
                 tags.healthcare || 
                 tags.shop || 
                 place.type ||
                 'clinic';

    // Construir dirección
    const direccion = this.buildAddress(place);

    // Obtener teléfono con múltiples opciones
    const telefono = tags.phone || 
                     tags.telephone || 
                     tags['contact:phone'] || 
                     tags.contact_phone ||
                     null;

    // Obtener horarios
    const horarios = tags.opening_hours || 
                     tags['opening_hours:covid'] || 
                     null;

    const extractedData = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      nombre: String(nombre).trim(),
      tipo: String(tipo).toLowerCase(),
      direccion,
      telefono,
      horarios,
      metadata: place, // Guardar todos los datos originales
    };

    console.log('[EstablecimientosService] Datos extraídos:', extractedData);
    return extractedData;
  }

  /**
   * Construye una dirección a partir de los datos del lugar
   */
  buildAddress(place) {
    const tags = place.tags || place.properties || {};
    const properties = place.properties || {};
    
    // Intentar obtener dirección completa primero
    const fullAddress = tags.addr_full || 
                       tags['addr:full'] || 
                       tags.address ||
                       place.address ||
                       properties.address;
    
    if (fullAddress && fullAddress.trim()) {
      return String(fullAddress).trim();
    }

    // Construir desde componentes individuales
    const street = tags['addr:street'] || tags.street || tags['street:name'];
    const number = tags['addr:housenumber'] || tags.housenumber || tags['street:number'];
    const city = tags['addr:city'] || tags.city || properties.city || tags.town || tags.village;
    
    const parts = [];
    if (street) parts.push(String(street).trim());
    if (number) parts.push(String(number).trim());
    if (city && !parts.includes(String(city).trim())) {
      parts.push(String(city).trim());
    }
    
    if (parts.length > 0) {
      return parts.join(', ');
    }

    // Fallback a componentes alternativos
    const suburb = tags['addr:suburb'] || tags.suburb;
    const neighbourhood = tags.neighbourhood || tags['addr:neighbourhood'];
    const postcode = tags['addr:postcode'] || tags.postcode;
    
    if (suburb) return String(suburb).trim();
    if (neighbourhood) return String(neighbourhood).trim();
    if (postcode) return String(postcode).trim();

    // Último fallback: coordenadas
    const lat = place.lat || place.center?.lat || place.geometry?.coordinates?.[1];
    const lng = place.lng || place.center?.lon || place.lon || place.geometry?.coordinates?.[0];
    
    if (lat && lng) {
      return `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`;
    }

    return 'Dirección no disponible';
  }

  /**
   * Busca un establecimiento por coordenadas
   */
  async findByCoordinates(lat, lng) {
    try {
      console.log(`[EstablecimientosService] Buscando establecimiento en: ${lat}, ${lng}`);
      
      // Validar coordenadas
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      
      if (isNaN(latNum) || isNaN(lngNum)) {
        console.error('[EstablecimientosService] Coordenadas inválidas:', lat, lng);
        return null;
      }

      const response = await api.get(`/establecimientos/coords/${latNum}/${lngNum}`);
      
      if (response.data && response.data.found !== false) {
        console.log('[EstablecimientosService] Establecimiento encontrado:', response.data);
        
        // Validar que tenga ID
        if (!response.data.id) {
          console.error('[EstablecimientosService] Establecimiento sin ID:', response.data);
          return null;
        }
        
        return response.data;
      }
      
      console.log('[EstablecimientosService] No se encontró establecimiento en esas coordenadas');
      return null;
    } catch (error) {
      console.error('[EstablecimientosService] Error buscando establecimiento:', error);
      
      // Si es error 404, es que no existe (normal)
      if (error.response?.status === 404) {
        console.log('[EstablecimientosService] 404 - Establecimiento no existe (normal)');
        return null;
      }
      
      // Otros errores si los relanzamos
      throw error;
    }
  }

  /**
   * Busca o crea un establecimiento basado en datos del mapa
   */
  async findOrCreate(place) {
    try {
      console.log('[EstablecimientosService] Iniciando findOrCreate con place:', place);
      
      // Extraer y validar datos
      const data = this.extractPlaceData(place);
      
      if (!data.lat || !data.lng) {
        throw new Error('No se pudieron extraer coordenadas válidas del lugar');
      }

      if (isNaN(data.lat) || isNaN(data.lng)) {
        throw new Error(`Coordenadas no numéricas: ${data.lat}, ${data.lng}`);
      }

      console.log('[EstablecimientosService] Datos extraídos válidos:', {
        nombre: data.nombre,
        tipo: data.tipo,
        lat: data.lat,
        lng: data.lng
      });

      // Intentar buscar establecimiento existente
      console.log('[EstablecimientosService] Buscando establecimiento existente...');
      let establecimiento = await this.findByCoordinates(data.lat, data.lng);
      
      // Si no existe, crear uno nuevo
      if (!establecimiento) {
        console.log('[EstablecimientosService] No existe, creando nuevo establecimiento...');
        
        try {
          const response = await api.post('/establecimientos/find-or-create', data);
          establecimiento = response.data;
          
          console.log('[EstablecimientosService] Establecimiento creado exitosamente:', establecimiento);
        } catch (createError) {
          console.error('[EstablecimientosService] Error creando establecimiento:', createError);
          console.error('[EstablecimientosService] Datos enviados:', data);
          console.error('[EstablecimientosService] Response:', createError.response?.data);
          
          throw new Error(
            createError.response?.data?.message || 
            'Error al crear el establecimiento en el servidor'
          );
        }
      } else {
        console.log('[EstablecimientosService] Establecimiento ya existe:', establecimiento);
      }

      // Validación final crítica
      if (!establecimiento) {
        throw new Error('No se pudo obtener el establecimiento (null)');
      }

      if (!establecimiento.id) {
        console.error('[EstablecimientosService] Establecimiento sin ID:', establecimiento);
        throw new Error('El establecimiento no tiene un ID válido');
      }

      // Validación adicional de campos críticos
      if (!establecimiento.nombre || establecimiento.nombre.trim() === '') {
        console.warn('[EstablecimientosService] Establecimiento sin nombre, usando fallback');
        establecimiento.nombre = data.nombre;
      }

      if (!establecimiento.lat || !establecimiento.lng) {
        console.warn('[EstablecimientosService] Establecimiento sin coordenadas, usando originales');
        establecimiento.lat = data.lat;
        establecimiento.lng = data.lng;
      }

      console.log('[EstablecimientosService] Retornando establecimiento válido:', {
        id: establecimiento.id,
        nombre: establecimiento.nombre,
        tipo: establecimiento.tipo,
        lat: establecimiento.lat,
        lng: establecimiento.lng
      });

      return establecimiento;
    } catch (error) {
      console.error('[EstablecimientosService] Error en findOrCreate:', error);
      console.error('[EstablecimientosService] Stack:', error.stack);
      throw error;
    }
  }

  /**
   * Obtiene un establecimiento por ID
   */
  async findById(id) {
    try {
      console.log('[EstablecimientosService] Buscando establecimiento por ID:', id);
      
      if (!id) {
        throw new Error('ID de establecimiento inválido');
      }

      const response = await api.get(`/establecimientos/${id}`);
      
      if (!response.data) {
        throw new Error('No se recibieron datos del establecimiento');
      }

      console.log('[EstablecimientosService] Establecimiento encontrado por ID:', response.data);
      return response.data;
    } catch (error) {
      console.error('[EstablecimientosService] Error obteniendo establecimiento por ID:', error);
      throw error;
    }
  }

  /**
   * Obtiene las reseñas de un establecimiento
   */
  async getResenias(id) {
    try {
      console.log('[EstablecimientosService] Obteniendo reseñas del establecimiento:', id);
      
      if (!id) {
        console.warn('[EstablecimientosService] ID inválido para obtener reseñas');
        return { resenias: [], estadisticas: { total: 0, promedioEstrellas: 0 } };
      }

      const response = await api.get(`/establecimientos/${id}/resenias`);
      console.log('[EstablecimientosService] Reseñas obtenidas:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('[EstablecimientosService] Error obteniendo reseñas:', error);
      return { resenias: [], estadisticas: { total: 0, promedioEstrellas: 0 } };
    }
  }

  /**
   * Lista todos los establecimientos con paginación
   */
  async findAll(skip = 0, take = 50) {
    try {
      console.log(`[EstablecimientosService] Listando establecimientos (skip: ${skip}, take: ${take})`);
      
      const response = await api.get(`/establecimientos?skip=${skip}&take=${take}`);
      
      console.log('[EstablecimientosService] Establecimientos obtenidos:', response.data?.length || 0);
      return response.data || [];
    } catch (error) {
      console.error('[EstablecimientosService] Error listando establecimientos:', error);
      return [];
    }
  }

  /**
   * Actualiza un establecimiento existente
   */
  async update(id, data) {
    try {
      console.log('[EstablecimientosService] Actualizando establecimiento:', id, data);
      
      if (!id) {
        throw new Error('ID de establecimiento inválido');
      }

      const response = await api.put(`/establecimientos/${id}`, data);
      
      console.log('[EstablecimientosService] Establecimiento actualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('[EstablecimientosService] Error actualizando establecimiento:', error);
      throw error;
    }
  }

  /**
   * Elimina un establecimiento
   */
  async delete(id) {
    try {
      console.log('[EstablecimientosService] Eliminando establecimiento:', id);
      
      if (!id) {
        throw new Error('ID de establecimiento inválido');
      }

      const response = await api.delete(`/establecimientos/${id}`);
      
      console.log('[EstablecimientosService] Establecimiento eliminado');
      return response.data;
    } catch (error) {
      console.error('[EstablecimientosService] Error eliminando establecimiento:', error);
      throw error;
    }
  }
}

// Exportar instancia única (singleton)
const establecimientosService = new EstablecimientosService();
export default establecimientosService;