import axios from 'axios';
import locationService from './locationService.js';
import { getNearbyPlaces, savePlaces } from './db.js';

// Servicio compatible con el componente Turnos.jsx
class TurnosService {
    constructor() {
        this.subscribers = new Set();
        this.currentState = {
            lugares: [],
            loading: false,
            error: ''
        };
        this.initialized = false;
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        // Enviar estado actual inmediatamente
        callback(this.currentState);
        
        return () => this.subscribers.delete(callback);
    }

    notify(newState) {
        this.currentState = { ...this.currentState, ...newState };
        this.subscribers.forEach(callback => {
            try {
                callback(this.currentState);
            } catch (error) {
                console.error('Error in turnos subscriber:', error);
            }
        });
    }

    async initialize() {
        if (this.initialized) return;
        
        // Suscribirse a cambios de ubicación
        locationService.subscribe(async (location) => {
            if (location) {
                await this.loadNearbyPlaces(location);
            }
        });

        this.initialized = true;
    }

    async loadNearbyPlaces(location) {
        this.notify({ loading: true, error: '' });
        
        try {
            // Preferir búsqueda online cuando el navegador está online.
            // Cargar offline solo como fallback en caso de falla o cuando estemos offline.
            let places = [];
            try {
                const types = ['hospital', 'clinic', 'doctors', 'veterinary'].join(',');
                const response = await axios.get(
                    `/api/places?lat=${location.lat}&lng=${location.lng}&types=${types}`
                );

                places = this.normalizeApiResponse(response.data);

                // Guardar en cache offline para uso posterior
                if (places.length > 0) {
                    try { await savePlaces(places); } catch (e) { console.warn('[TurnosService] No se pudo guardar cache de lugares:', e); }
                }
            } catch (onlineError) {
                console.warn('TurnosService: error fetching online places, falling back to cache', onlineError);
                const offlinePlaces = await getNearbyPlaces(location);
                places = offlinePlaces;
            }

            this.notify({ lugares: places, loading: false, error: '' });

        } catch (error) {
            console.error('Error loading places for turnos:', error);
            this.notify({ 
                lugares: [], 
                loading: false, 
                error: 'Error cargando lugares cercanos' 
            });
        }
    }

    normalizeApiResponse(data) {
        let results = [];
        if (Array.isArray(data)) results = data;
        else if (Array.isArray(data.lugares)) results = data.lugares;
        else if (Array.isArray(data.elements)) results = data.elements;
        else if (Array.isArray(data.features)) results = data.features;
        else results = data.elements ?? data.lugares ?? [];

        return results.map(place => ({
            ...place,
            lat: place.lat ?? place.center?.lat ?? place.geometry?.coordinates?.[1],
            lng: place.lng ?? place.lon ?? place.center?.lon ?? place.geometry?.coordinates?.[0],
            type: this.getTypeFromPlace(place)
        }));
    }

    getTypeFromPlace(place) {
        const tags = place.tags ?? place.properties ?? {};
        const amenity = (tags.amenity || tags.healthcare || '').toString().toLowerCase();
        const name = (tags.name || '').toString().toLowerCase();

        if (amenity.includes('hospital') || name.includes('hospital')) return 'hospital';
        if (amenity.includes('clinic') || name.includes('clínica') || name.includes('clinic')) return 'clinic';
        if (amenity.includes('veterinary') || name.includes('veterin')) return 'veterinary';
        if (amenity.includes('doctor') || name.includes('doctor') || name.includes('médic')) return 'doctors';

        return 'default';
    }
}

// Singleton
const turnosService = new TurnosService();

// ✅ FUNCIÓN AGREGADA: saveAppointment (era la que faltaba)
export const saveAppointment = async (payload) => {
    try {
        // console.log('[TurnosService] Guardando turno con payload:', payload);

    // Obtener el token JWT del localStorage
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Agregar el token si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/turnos', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        usuarioId: payload.usuarioId,
        establecimientoId: payload.establecimientoId,
        fecha: payload.fecha,
        hora: payload.hora
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    // console.log('[TurnosService] Turno guardado exitosamente:', data);
    return data;

  } catch (error) {
    console.error('[TurnosService] Error guardando turno:', error);
    throw error;
  }
};

// Funciones de API originales (mantener compatibilidad)
export const guardarTurno = async (payload) => {
  // Esta función ahora simplemente llama a saveAppointment
  return saveAppointment(payload);
};

export const fetchMisTurnos = async (correo) => {
    if (!correo) {
        // console.log('[DEBUG] No hay correo, retornando array vacío');
        return [];
    }

    // console.log('[DEBUG] Fetching turnos para:', correo);
    // Solicitar también los turnos cancelados para poder mostrarlos en la UI agrupados
    const res = await axios.get(`/api/turnos?user=${encodeURIComponent(correo)}&includeCancelled=true`);
    const data = res.data;
    // console.log('[DEBUG] Respuesta completa del servidor:', data);

    const arr = Array.isArray(data) ? data : (Array.isArray(data?.turnos) ? data.turnos : []);
    // console.log('[DEBUG] Turnos procesados:', arr);
    return arr;
};

export const cancelAppointment = async (id) => {
    // console.log('[Turnos] cancelarTurno called, id=', id);
    if (!id) {
        throw new Error('No se pudo cancelar: id de turno inexistente');
    }

    const url = `/api/turnos/${encodeURIComponent(id)}`;
    // console.log('[Turnos] PUT', url);
    // El backend espera la acción 'cancelar' (cadena en español)
    const res = await axios.put(url, { action: 'cancelar' });
    // console.log('[Turnos] respuesta cancel completa:', res);
    return res;
};

export default turnosService;