// Función para obtener la ubicación del usuario una sola vez
// Utiliza la API de Geolocalización del navegador
export function obtenerUbicacionUnaVez(callback) {
  if (!('geolocation' in navigator)) {
    console.warn('Geolocalización no disponible en este navegador');
    callback(null);
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (posicion) => {
      const { latitude: latitud, longitude: longitud } = posicion.coords;
      callback({ lat: latitud, lng: longitud });
    },
    (error) => {
      console.error('Error al obtener la ubicación', error);
      callback(null);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

// Función para observar cambios en la ubicación
export function observarUbicacion(callback) {
  if (!('geolocation' in navigator)) {
    console.warn('Geolocalización no disponible en este navegador');
    return null;
  }
  const watchId = navigator.geolocation.watchPosition(
    (posicion) => {
      const { latitude: latitud, longitude: longitud } = posicion.coords;
      callback({ lat: latitud, lng: longitud });
    },
    (error) => {
      console.error('Error al observar la ubicación', error);
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
  );
  return watchId;
}

// Función para detener la observación
export function detenerObservacion(watchId) {
  if (watchId != null && 'geolocation' in navigator) {
    navigator.geolocation.clearWatch(watchId);
  }
}