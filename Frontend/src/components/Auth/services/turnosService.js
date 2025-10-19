// INICIO CAMBIO - Archivo: src/services/turnosService.js - Archivo nuevo para integrar turnos
import React, { useState, useEffect } from 'react';
import locationService from './locationService.js';
import placesApiService from './placesApiService.js';

class TurnosService {
    constructor() {
        this.subscribers = new Set();
        this.currentPlaces = [];
        this.isLoading = false;
        this.error = null;
    }

    // Suscribirse a cambios de lugares
    subscribe(callback) {
        this.subscribers.add(callback);
        // Enviar estado actual
        callback({
            lugares: this.currentPlaces,
            loading: this.isLoading,
            error: this.error
        });

        return () => this.subscribers.delete(callback);
    }

    // Notificar cambios a suscriptores
    notify(data) {
        this.subscribers.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('[TurnosService] Error en callback:', error);
            }
        });
    }

    // Obtener profesionales cercanos
    async fetchProfesionales(location) {
        if (!location?.lat || !location?.lng) return;

        try {
            this.isLoading = true;
            this.error = null;
            this.notify({
                lugares: this.currentPlaces,
                loading: this.isLoading,
                error: this.error
            });

            // Usar el servicio de API centralizado
            const result = await placesApiService.fetchPlaces(
                location.lat,
                location.lng,
                ['hospital', 'clinic', 'doctors', 'veterinary'],
                3000
            );

            this.currentPlaces = result.data;
            this.isLoading = false;

            // Establecer mensaje según fuente
            if (result.isOffline) {
                this.error = result.source === 'mock' ? 'Datos de ejemplo (desarrollo)' : 'Modo offline';
            } else {
                this.error = null;
            }

            this.notify({
                lugares: this.currentPlaces,
                loading: this.isLoading,
                error: this.error
            });

        } catch (error) {
            console.error('[TurnosService] Error obteniendo profesionales:', error);
            this.isLoading = false;
            this.error = `Error: ${error.message}`;
            this.notify({
                lugares: this.currentPlaces,
                loading: this.isLoading,
                error: this.error
            });
        }
    }

    // Inicializar con ubicación actual
    async initialize() {
        // Suscribirse a cambios de ubicación
        const unsubscribe = locationService.subscribe((location) => {
            console.log('[TurnosService] Nueva ubicación:', location);
            this.fetchProfesionales(location);
        });

        // Cargar última ubicación conocida
        await locationService.loadLastKnownLocation();

        return unsubscribe;
    }

    // Obtener ubicación actual
    getCurrentLocation() {
        return locationService.currentLocation;
    }

    // Establecer ubicación manual
    async setManualLocation(lat, lng) {
        return await locationService.setManualLocation(lat, lng);
    }
}

// Hook personalizado para usar en componentes React
export function useProfesionales() {
    const [state, setState] = useState({
        lugares: [],
        loading: false,
        error: null
    });

    useEffect(() => {
        const unsubscribe = turnosService.subscribe(setState);
        turnosService.initialize();

        return unsubscribe;
    }, []);

    return state;
}

// Singleton
const turnosService = new TurnosService();
export default turnosService;
// FIN CAMBIO - Archivo: src/services/turnosService.js