import { useState, useCallback } from 'react';
import turnosService from '../../../services/turnosService';

export function useTurnos() {
  const [misTurnos, setMisTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cargarMisTurnos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const turnos = await turnosService.getMisTurnos();
      setMisTurnos(turnos);
    } catch (e) {
      setError('Error al cargar turnos');
      setMisTurnos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const solicitarTurno = useCallback(async (payload) => {
    setError('');
    try {
      await turnosService.solicitarTurno(payload);
      await cargarMisTurnos();
      return true;
    } catch (e) {
      setError('Error al solicitar turno');
      return false;
    }
  }, [cargarMisTurnos]);

  const cancelarTurno = useCallback(async (id) => {
    setError('');
    try {
      await turnosService.cancelarTurno(id);
      await cargarMisTurnos();
      return true;
    } catch (e) {
      setError('Error al cancelar turno');
      return false;
    }
  }, [cargarMisTurnos]);

  return { misTurnos, loading, error, cargarMisTurnos, solicitarTurno, cancelarTurno };
}
