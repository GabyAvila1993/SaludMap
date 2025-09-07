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
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocalización no disponible'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        source: 'gps',
                        timestamp: Date.now()
                    };

                    // Guardar en IndexedDB
                    await saveLocation(location);
                    this.notify(location);
                    resolve(location);
                },
                (error) => {
                    console.error('Error GPS:', error);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                }
            );
        });
    }

    // Iniciar seguimiento continuo
    startWatching() {
        if (this.isWatching || !navigator.geolocation) return;

        this.watchId = navigator.geolocation.watchPosition(
            async (position) => {
                // No sobrescribir ubicaciones manuales con GPS automático
                if (this.currentLocation && this.currentLocation.source === 'manual') {
                    // Nunca sobrescribir ubicaciones manuales automáticamente
                    return;
                }

                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    source: 'gps',
                    timestamp: Date.now()
                };

                await saveLocation(location);
                this.notify(location);
            },
            (error) => console.warn('Error en watchPosition:', error),
            {
                enableHighAccuracy: true,
                maximumAge: 10000, // Aumentar para evitar actualizaciones frecuentes
                timeout: 20000
            }
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
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocalización no disponible'));
                return;
            }

            // Usar getCurrentPosition que es más simple y confiable
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const calibratedLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        source: 'calibrated',
                        samples: 1,
                        timestamp: Date.now()
                    };

                    try {
                        await saveLocation(calibratedLocation);
                        this.notify(calibratedLocation);
                        resolve(calibratedLocation);
                    } catch (error) {
                        reject(new Error('Error guardando ubicación: ' + error.message));
                    }
                },
                (error) => {
                    let errorMessage = 'Error obteniendo ubicación: ';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage += 'Permisos de ubicación denegados';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage += 'Ubicación no disponible';
                            break;
                        case error.TIMEOUT:
                            errorMessage += 'Tiempo de espera agotado';
                            break;
                        default:
                            errorMessage += 'Error desconocido';
                            break;
                    }
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
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