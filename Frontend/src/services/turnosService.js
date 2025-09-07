import axios from 'axios';
import locationService from './locationService.js';
import { getNearbyPlaces } from './db.js';

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
            // Intentar cargar desde cache offline primero
            const offlinePlaces = await getNearbyPlaces(location);
            
            if (offlinePlaces.length > 0) {
                this.notify({ 
                    lugares: offlinePlaces, 
                    loading: false, 
                    error: '' 
                });
                return;
            }

            // Si no hay datos offline, intentar cargar online
            const types = ['hospital', 'clinic', 'doctors', 'veterinary'].join(',');
            const response = await axios.get(
                `/places?lat=${location.lat}&lng=${location.lng}&types=${types}`
            );

            const places = this.normalizeApiResponse(response.data);
            
            this.notify({ 
                lugares: places, 
                loading: false, 
                error: '' 
            });

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

// Funciones de API originales (mantener compatibilidad)
export const saveAppointment = async (payload) => {
    try {
        console.log('[DEBUG] Enviando payload al backend:', payload);
        const response = await axios.post('/turnos', payload);
        console.log('[DEBUG] ✅ Turno guardado en backend:', response.data);
        return response.data;
    } catch (error) {
        console.error('[DEBUG] ❌ Error guardando turno:', error);
        console.error('[DEBUG] Error response:', error.response?.data);
        console.error('[DEBUG] Error status:', error.response?.status);
        throw error;
    }
};

export const fetchMisTurnos = async (correo) => {
    if (!correo) {
        console.log('[DEBUG] No hay correo, retornando array vacío');
        return [];
    }

    console.log('[DEBUG] Fetching turnos para:', correo);
    const res = await axios.get(`/turnos?user=${encodeURIComponent(correo)}`);
    const data = res.data;
    console.log('[DEBUG] Respuesta completa del servidor:', data);

    const arr = Array.isArray(data) ? data : (Array.isArray(data?.turnos) ? data.turnos : []);
    console.log('[DEBUG] Turnos procesados:', arr);
    return arr;
};

export const cancelAppointment = async (id) => {
    console.log('[Turnos] cancelarTurno called, id=', id);
    if (!id) {
        throw new Error('No se pudo cancelar: id de turno inexistente');
    }

    const url = `/turnos/${encodeURIComponent(id)}`;
    console.log('[Turnos] PUT', url);
    const res = await axios.put(url, { action: 'cancel' });
    console.log('[Turnos] respuesta cancel completa:', res);
    return res;
};

export default turnosService;