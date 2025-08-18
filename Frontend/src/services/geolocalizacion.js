// Función para obtener la ubicación del usuario una sola vez
// Utiliza la API de Geolocalización del navegador
export function obtenerUbicacionUnaVez(callback) {
    if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
        (posicion) => {
        const { latitude: latitud, longitude: longitud } = posicion.coords;
        callback({ lat: latitud, lng: longitud });
        },
        (error) => {
        console.error("Error al obtener la ubicación", error);
        callback(null);
        }
    );
    } else {
    console.warn("Geolocalización no disponible en este navegador");
    callback(null);
    }
}

// Función para observar cambios en la ubicación
export function observarUbicacion(callback) {
    if ("geolocation" in navigator) {
    const watchId = navigator.geolocation.watchPosition(
        (posicion) => {
        const { latitude: latitud, longitude: longitud } = posicion.coords;
        callback({ lat: latitud, lng: longitud });
        },
        (error) => {
        console.error("Error al observar la ubicación", error);
        },
        {
        enableHighAccuracy: true, // Mayor precisión (más consumo de batería)
        maximumAge: 10000,        // Usa posición en caché hasta 10 segundos
        timeout: 10000            // Máximo tiempo de espera antes de error
        }
    );
    return watchId;
    } else {
    console.warn("Geolocalización no disponible en este navegador");
    return null;
    }
}

// Función para detener la observación
export function detenerObservacion(watchId) {
    if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    }
}
