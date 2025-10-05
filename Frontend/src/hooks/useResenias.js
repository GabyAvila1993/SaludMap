import { useState, useEffect, useCallback } from 'react';
import reseniasService from '../services/reseniasService';

/**
 * Hook personalizado para manejar reseñas
 */
export function useResenias(establecimientoId) {
  const [resenias, setResenias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [promedioEstrellas, setPromedioEstrellas] = useState(0);
  const [totalResenias, setTotalResenias] = useState(0);

  // Cargar reseñas del establecimiento
  const cargarResenias = useCallback(async () => {
    if (!establecimientoId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await reseniasService.obtenerResenias(establecimientoId);
      setResenias(data);
      setTotalResenias(data.length);

      // Calcular promedio de estrellas
      if (data.length > 0) {
        const suma = data.reduce((acc, r) => acc + r.puntuacion, 0);
        setPromedioEstrellas((suma / data.length).toFixed(1));
      } else {
        setPromedioEstrellas(0);
      }
    } catch (err) {
      console.error('Error cargando reseñas:', err);
      setError(err.message || 'Error cargando reseñas');
      setResenias([]);
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
    if (!turnoId) return;

    const validar = async () => {
      setLoading(true);
      setError(null);

      try {
        const resultado = await reseniasService.validarPuedeReseniar(turnoId);
        setPuedeReseniar(resultado.valido);
        setMensaje(resultado.mensaje);
      } catch (err) {
        console.error('Error validando reseña:', err);
        setPuedeReseniar(false);
        setError(err.response?.data?.message || err.message);
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
 */
export function useTurnosParaReseniar(establecimientoId = null) {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarTurnos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await reseniasService.getTurnosParaReseniar(establecimientoId);
      setTurnos(data);
    } catch (err) {
      console.error('Error cargando turnos:', err);
      setError(err.message);
      setTurnos([]);
    } finally {
      setLoading(false);
    }
  }, [establecimientoId]);

  useEffect(() => {
    cargarTurnos();
  }, [cargarTurnos]);

  return { turnos, loading, error, refrescar: cargarTurnos };
}
