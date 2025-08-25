import { useState, useRef, useEffect } from 'react';
import lugaresService from '../../../services/lugaresService';

export function useLugaresCercanos(pos) {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const prevPosRef = useRef(null);
  const fetchTimeoutRef = useRef(null);

  useEffect(() => {
    if (!pos) return;
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(async () => {
      try {
        const minDist = 20;
        const dist = lugaresService.distanceMeters(prevPosRef.current, pos);
        if (prevPosRef.current && dist < minDist) return;
        setLoading(true);
        const lugaresCercanos = await lugaresService.getLugaresCercanos(pos);
        setLugares(lugaresCercanos);
        setError('');
        prevPosRef.current = pos;
      } catch (e) {
        setError('No se pudieron cargar profesionales.');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current); };
  }, [pos]);

  return { lugares, loading, error };
}
