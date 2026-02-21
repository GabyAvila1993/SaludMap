import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponents.css';
import { obtenerUbicacionUnaVez, observarUbicacion, detenerObservacion } from '../services/geolocalizacion.js';
import { precargarArea } from '../services/offline.js';
import L from 'leaflet';

// Icono de usuario
const userIcon = L.divIcon({
  html: `<div class="user-icon"></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Recentrar mapa
function Recentrar({ position }) {
  const map = useMap();
  useEffect(() => {
    if (!position) return;

    let userInteracting = false;
    let lastInteraction = 0;

    const onUserStart = () => {
      userInteracting = true;
      lastInteraction = Date.now();
    };
    const onUserEnd = () => {
      lastInteraction = Date.now();
      setTimeout(() => {
        if (Date.now() - lastInteraction > 1200) userInteracting = false;
      }, 1200);
    };

    try {
      map.on('movestart', onUserStart);
      map.on('zoomstart', onUserStart);
      map.on('moveend', onUserEnd);
      map.on('zoomend', onUserEnd);
    } catch {
      // noop
    }

    try {
      // No recenter if user is interacting.
      if (userInteracting) return;

      const center = map.getCenter();
      const target = L.latLng(position[0], position[1]);
      const dist = center ? center.distanceTo(target) : Infinity;
      const DISTANCE_THRESHOLD = 25; // meters
      if (dist > DISTANCE_THRESHOLD) {
        map.setView(position, map.getZoom());
      }
    } catch {
      // noop
    }

    return () => {
      try {
        map.off('movestart', onUserStart);
        map.off('zoomstart', onUserStart);
        map.off('moveend', onUserEnd);
        map.off('zoomend', onUserEnd);
      } catch {
        // noop
      }
    };
  }, [position, map]);
  return null;
}

export default function MapComponents() {
  const [pos, setPos] = useState(null);
  const watchIdRef = useRef(null);

  // Geolocalización
  useEffect(() => {
    obtenerUbicacionUnaVez((p) => {
      if (p) setPos([p.lat, p.lng]);
    });

    watchIdRef.current = observarUbicacion((p) => {
      if (p) setPos([p.lat, p.lng]);
    });

    return () => {
      if (watchIdRef.current !== null) {
        detenerObservacion(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  // Funciones botones
  const handleDetener = () => {
    if (watchIdRef.current) {
      detenerObservacion(watchIdRef.current);
      watchIdRef.current = null;
      alert('Observación detenida');
    }
  };

  const handleDescargar = async () => {
    if (!pos) return;

    const bounds = {
      north: pos[0] + 0.02,
      south: pos[0] - 0.02,
      east: pos[1] + 0.02,
      west: pos[1] - 0.02,
    };

    await precargarArea(bounds, [14, 15], async ({ lat, lng }) => {
      try {
        const res = await fetch(
          `/places?lat=${lat}&lng=${lng}&types=hospital,clinic,doctors,veterinary`
        );
        const data = await res.json();
        return data.lugares ?? data.elements ?? [];
      } catch {
        console.warn('No se pudo precargar lugares:', lat, lng);
        return [];
      }
    });

    alert('Área precargada para uso offline ✅');
  };

  return (
    <div className="map-root">
      

      {!pos ? (
        <p>Obteniendo ubicación...</p>
      ) : (
        <>
          <div className="map-wrapper">
            <MapContainer center={pos} zoom={13} className="leaflet-map">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={pos} icon={userIcon} />
              <Circle center={pos} radius={30} />
              <Recentrar position={pos} />
            </MapContainer>
          </div>

          {/* Botones visibles fuera del mapa */}
          <div className="map-buttons">
            <button className="btn" onClick={handleDetener}>Detener</button>
            <button className="btn" onClick={handleDescargar}>Descargar área offline</button>
          </div>
        </>
      )}
    </div>
  );
}
