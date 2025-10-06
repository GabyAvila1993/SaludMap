// src/hooks/useResenias.js
import { useState, useEffect, useCallback } from 'react';
import reseniasService from '../services/reseniasService';
import { useAuth } from '../components/Auth/AuthContext';

/**
 * Hook personalizado para manejar reseñas
 */
export function useResenias(establecimientoId) {
  const { user } = useAuth();
  const [resenias, setResenias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [promedioEstrellas, setPromedioEstrellas] = useState(0);
  const [totalResenias, setTotalResenias] = useState(0);

  // Cargar reseñas del establecimiento
  const cargarResenias = useCallback(async () => {
    if (!establecimientoId) {
      setResenias([]);
      setTotalResenias(0);
      setPromedioEstrellas(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[useResenias] Cargando reseñas para establecimiento:', establecimientoId);
      
      const data = await reseniasService.obtenerResenias(establecimientoId);
      
      console.log('[useResenias] Reseñas obtenidas:', data);
      
      setResenias(data || []);
      setTotalResenias(data?.length || 0);

      // Calcular promedio de estrellas
      if (data && data.length > 0) {
        const suma = data.reduce((acc, r) => acc + (r.puntuacion || 0), 0);
        const promedio = (suma / data.length).toFixed(1);
        setPromedioEstrellas(parseFloat(promedio));
      } else {
        setPromedioEstrellas(0);
      }
    } catch (err) {
      console.error('[useResenias] Error cargando reseñas:', err);
      setError(err.message || 'Error cargando reseñas');
      setResenias([]);
      setTotalResenias(0);
      setPromedioEstrellas(0);
    } finally {
      setLoading(false);
    }
  }, [establecimientoId]);

  // Cargar reseñas al montar o cuando cambie el establecimientoId
  useEffect(() => {
    cargarResenias();
  }, [cargarResenias]);

  // Refrescar reseñas manualmente
  const refrescar = useCallback(() => {
    console.log('[useResenias] Refrescando reseñas...');
    cargarResenias();
  }, [cargarResenias]);

  return {
    resenias,
    loading,
    error,
    promedioEstrellas,
    totalResenias,
    refrescar,
  };
}

/**
 * Hook para validar si el usuario puede dejar una reseña
 */
export function useValidarResenia(turnoId) {
  const [puedeReseniar, setPuedeReseniar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!turnoId) {
      setPuedeReseniar(false);
      setMensaje('');
      return;
    }

    const validar = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('[useValidarResenia] Validando turno:', turnoId);
        
        const resultado = await reseniasService.validarPuedeReseniar(turnoId);
        
        console.log('[useValidarResenia] Resultado:', resultado);
        
        setPuedeReseniar(resultado.valido || false);
        setMensaje(resultado.mensaje || '');
      } catch (err) {
        console.error('[useValidarResenia] Error validando reseña:', err);
        setPuedeReseniar(false);
        setError(err.response?.data?.message || err.message || 'Error validando');
        setMensaje('No puede dejar una reseña para este turno');
      } finally {
        setLoading(false);
      }
    };

    validar();
  }, [turnoId]);

  return { puedeReseniar, loading, error, mensaje };
}

/**
 * Hook para obtener turnos que pueden ser reseñados
 * Filtra turnos que:
 * - Ya pasaron (fecha < hoy)
 * - Pertenecen al establecimiento especificado (si se proporciona)
 * - No tienen reseña asociada
 * - Pertenecen al usuario autenticado
 */
export function useTurnosParaReseniar(establecimientoId = null) {
  const { user } = useAuth();
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarTurnos = useCallback(async () => {
    if (!user) {
      console.log('[useTurnosParaReseniar] No hay usuario autenticado');
      setTurnos([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[useTurnosParaReseniar] Cargando turnos para establecimiento:', establecimientoId);
      
      const data = await reseniasService.getTurnosParaReseniar(establecimientoId);
      
      console.log('[useTurnosParaReseniar] Turnos obtenidos:', data);
      
      setTurnos(data || []);
    } catch (err) {
      console.error('[useTurnosParaReseniar] Error:', err);
      setError(err.message || 'Error cargando turnos disponibles');
      setTurnos([]);
    } finally {
      setLoading(false);
    }
  }, [establecimientoId, user]);

  useEffect(() => {
    cargarTurnos();
  }, [cargarTurnos]);

  return { turnos, loading, error, refrescar: cargarTurnos };
}