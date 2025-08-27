import { useState, useEffect, useRef } from 'react';
import { fetchProfesionales } from '../services/placesServices.js';
import { distanceMeters } from '../utils/geoUtils';

export const useProfesionales = (pos) => {
    const [lugares, setLugares] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fetchTimeoutRef = useRef(null);
    const prevPosRef = useRef(null);

    useEffect(() => {
        if (!pos) return;
        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);

        fetchTimeoutRef.current = setTimeout(async () => {
            try {
                console.log('[Turnos] pos changed ->', pos, 'prevPos ->', prevPosRef.current);
                const minDist = 20;
                const dist = distanceMeters(prevPosRef.current, pos);
                if (prevPosRef.current && dist < minDist) {
                    console.log(`[Turnos] movimiento ${Math.round(dist)}m < ${minDist}m — salto fetch`);
                    return;
                }

                setLoading(true);
                const resultados = await fetchProfesionales(pos);
                setLugares(resultados);
                setError('');
                prevPosRef.current = pos;
            } catch (e) {
                console.warn('Error cargando profesionales', e);
                setError('No se pudieron cargar profesionales.');
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => {
            if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
        };
    }, [pos]);

    const updatePrevPos = (newPos) => {
        prevPosRef.current = newPos;
    };

    return { lugares, loading, error, updatePrevPos };
};
