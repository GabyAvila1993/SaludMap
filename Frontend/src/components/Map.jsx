// src/components/Map.jsx
import { useEffect, useState } from 'react';
import {
    obtenerUbicacionUnaVez,
    observarUbicacion,
    detenerObservacion
} from '../services/geolocalizacion.js';

function Mapa() {
    const [ubicacion, setUbicacion] = useState(null);
    const [watchId, setWatchId] = useState(null);

    useEffect(() => {
    // Obtener ubicación una sola vez al cargar
    obtenerUbicacionUnaVez((pos) => {
        if (pos) setUbicacion(pos);
    });

    // Observar cambios en la ubicación
    const id = observarUbicacion((pos) => {
        if (pos) setUbicacion(pos);
    });

    setWatchId(id);

    // Limpiar observador al desmontar el componente
    return () => {
        detenerObservacion(id);
    };
    }, []);

    return (
    <div>
        <h2>Ubicación actual:</h2>
        {ubicacion ? (
        <p>Latitud: {ubicacion.lat}, Longitud: {ubicacion.lng}</p>
        ) : (
        <p>Obteniendo ubicación...</p>
        )}
    </div>
    );
}

export default Mapa;
