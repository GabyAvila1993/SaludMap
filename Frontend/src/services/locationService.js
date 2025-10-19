// INICIO CAMBIO - Archivo: src/services/locationService.js - Archivo nuevo para gestión de ubicaciones
import { saveLocation, getLastLocation } from './db.js';

class LocationService {
    constructor() {
        this.watchId = null;
        this.subscribers = new Set();
        this.currentLocation = null;
        this.isWatching = false;
    }

    // Suscribirse a cambios de ubicación
    subscribe(callback) {
        this.subscribers.add(callback);
        // Enviar ubicación actual si existe
        if (this.currentLocation) {
            callback(this.currentLocation);
        }

        // Retornar función para desuscribirse
        return () => this.subscribers.delete(callback);
    }

    // Notificar a todos los suscriptores
    notify(location) {
        this.currentLocation = location;
        this.subscribers.forEach(callback => {
            try {
                callback(location);
            } catch (error) {
                console.error('Error en callback de ubicación:', error);
            }
        });
    }

    // Obtener ubicación una vez
    async getCurrentPosition() {
        // Implementar reintentos y fallback para evitar errores por timeout
        if (!navigator.geolocation) {
            throw new Error('Geolocalización no disponible');
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        };

        const maxAttempts = 3;
        let lastError = null;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const position = await this._getPositionPromise(options);
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    source: 'gps',
                    timestamp: Date.now()
                };

                await saveLocation(location);
                this.notify(location);
                return location;
            } catch (error) {
                lastError = error;
                console.warn(`[LocationService] getCurrentPosition attempt ${attempt} failed:`, error);
                // small backoff before retry
                if (attempt < maxAttempts) await new Promise(r => setTimeout(r, 500 * attempt));
            }
        }

        // Si fallaron los reintentos, intentar usar la última ubicación conocida
        try {
            const last = await getLastLocation();
            if (last) {
                console.warn('[LocationService] Usando última ubicación conocida como fallback');
                this.notify(last);
                return last;
            }
        } catch (err) {
            console.warn('[LocationService] Error al obtener última ubicación:', err);
        }

        // Intentar un fallback por IP (público) como último recurso
        try {
            const resp = await fetch('https://ipapi.co/json/');
            if (resp.ok) {
                const data = await resp.json();
                if (data && data.latitude && data.longitude) {
                    const ipLoc = {
                        lat: Number(data.latitude),
                        lng: Number(data.longitude),
                        accuracy: null,
                        source: 'ip',
                        timestamp: Date.now()
                    };
                    console.warn('[LocationService] Usando geolocalización por IP como fallback');
                    try { await saveLocation(ipLoc); } catch { /* noop */ }
                    this.notify(ipLoc);
                    return ipLoc;
                }
            }
        } catch (err) {
            console.warn('[LocationService] Fallback IP falló:', err);
        }

        // Emitir evento de error para que la UI pueda reaccionar
        window.dispatchEvent(new CustomEvent('saludmap:pos-error', { detail: { error: lastError } }));
        throw lastError;
    }

    // Helper para envolver getCurrentPosition en una Promise
    _getPositionPromise(options) {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
    }

    // Iniciar seguimiento continuo
    startWatching() {
        if (this.isWatching || !navigator.geolocation) return;

        const options = {
            enableHighAccuracy: true,
            maximumAge: 15000,
            timeout: 30000
        };

        this.watchId = navigator.geolocation.watchPosition(
            async (position) => {
                // No sobrescribir ubicaciones manuales con GPS automático
                if (this.currentLocation && this.currentLocation.source === 'manual') {
                    return;
                }

                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    source: 'gps',
                    timestamp: Date.now()
                };

                try {
                    await saveLocation(location);
                } catch (err) {
                    console.warn('[LocationService] Error guardando ubicación:', err);
                }
                this.notify(location);
            },
            (error) => {
                console.warn('[LocationService] Error en watchPosition:', error);
                // Si es timeout, emitir evento y usar fallback
                if (error && error.code === error.TIMEOUT) {
                    window.dispatchEvent(new CustomEvent('saludmap:pos-error', { detail: { error } }));
                    // Usar última ubicación conocida para mantener la app funcional
                    this.loadLastKnownLocation().catch(() => {});
                }
                // Si el permiso fue denegado, detener watch para evitar logs repetidos
                if (error && error.code === error.PERMISSION_DENIED) {
                    this.stopWatching();
                }
            },
            options
        );

        this.isWatching = true;
    }

    // Detener seguimiento
    stopWatching() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
            this.isWatching = false;
        }
    }

    // Calibrar posición - versión simplificada y confiable
    async calibratePosition() {
        // Reintentar un par de veces para evitar fallos por timeout
        if (!navigator.geolocation) throw new Error('Geolocalización no disponible');

        const options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };
        const attempts = 2;
        let lastErr = null;

        for (let i = 1; i <= attempts; i++) {
            try {
                const position = await this._getPositionPromise(options);
                const calibratedLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    source: 'calibrated',
                    samples: 1,
                    timestamp: Date.now()
                };

                await saveLocation(calibratedLocation);
                this.notify(calibratedLocation);
                return calibratedLocation;
            } catch (error) {
                lastErr = error;
                console.warn(`[LocationService] calibratePosition attempt ${i} failed:`, error);
                if (i < attempts) await new Promise(r => setTimeout(r, 400 * i));
            }
        }

        // Emitir evento para UI
        window.dispatchEvent(new CustomEvent('saludmap:pos-error', { detail: { error: lastErr } }));
        throw lastErr;
    }

    // Establecer ubicación manual
    async setManualLocation(lat, lng) {
        const location = {
            lat,
            lng,
            accuracy: null,
            source: 'manual',
            timestamp: Date.now()
        };

        await saveLocation(location);
        this.notify(location);
        return location;
    }

    // Cargar última ubicación conocida
    async loadLastKnownLocation() {
        const lastLocation = await getLastLocation();
        if (lastLocation) {
            this.currentLocation = lastLocation;
            this.notify(lastLocation);
        }
        return lastLocation;
    }

    // Cleanup al destruir el servicio
    destroy() {
        this.stopWatching();
        this.subscribers.clear();
        this.currentLocation = null;
    }
}

// Singleton
const locationService = new LocationService();
export default locationService;
// FIN CAMBIO - Archivo: src/services/locationService.js