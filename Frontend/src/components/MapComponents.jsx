import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { obtenerUbicacionUnaVez, observarUbicacion, detenerObservacion } from '../services/geolocalizacion.js';

function Recentrar({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) map.setView(position, map.getZoom());
    }, [position, map]);
    return null;
}

export default function GeoMap() {
    const [pos, setPos] = useState(null);
    const watchIdRef = useRef(null);

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

    return (
        <div style={{ height: '100vh' }}>
            <MapContainer center={pos ?? [-32.9, -68.8]} zoom={13} style={{ height: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {pos && (
                    <>
                        <Marker position={pos} />
                        <Circle center={pos} radius={30} />
                        <Recentrar position={pos} />
                    </>
                )}
            </MapContainer>
            <button
                style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}
                onClick={() => {
                    if (watchIdRef.current) {
                        detenerObservacion(watchIdRef.current);
                        watchIdRef.current = null;
                        alert('Observación detenida');
                    }
                }}
            >
                Detener
            </button>
        </div>
    );
}