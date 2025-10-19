/**
 * Hook para obtener turnos disponibles para reseñar
 * Solo devuelve turnos que:
 * - Pertenecen al usuario actual
 * - Son del establecimiento especificado
 * - Ya pasaron (fecha < hoy)
 * - No tienen reseña asociada
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../components/Auth/AuthContext';
import reseniasService from '../services/reseniasService';

export function useTurnosParaReseniar(establecimientoId) {
  const { user } = useAuth() || {};
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarTurnos = async () => {
      if (!user || !establecimientoId) {
        setTurnos([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('[useTurnosParaReseniar] Cargando turnos para usuario:', user.mail);
        console.log('[useTurnosParaReseniar] Establecimiento:', establecimientoId);
        
        const turnosDisponibles = await reseniasService.obtenerTurnosParaReseniar(
          user.mail,
          establecimientoId
        );
        
        console.log('[useTurnosParaReseniar] Turnos disponibles:', turnosDisponibles);
        
        setTurnos(turnosDisponibles || []);
      } catch (err) {
        console.error('[useTurnosParaReseniar] Error cargando turnos:', err);
        setError(err.message || 'Error al cargar los turnos');
        setTurnos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarTurnos();
  }, [user, establecimientoId]);

  return {
    turnos,
    loading,
    error
  };
}