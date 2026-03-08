import axios from 'axios';

/**
 * Obtiene todas las especialidades disponibles
 */
export const getEspecialidades = async () => {
    try {
        const res = await axios.get('/api/especialidades');
        return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
        console.error('[EspecialidadesService] Error obteniendo especialidades:', error);
        throw error;
    }
};

/**
 * Obtiene las especialidades de un establecimiento específico
 * @param {number} establecimientoId
 */
export const getEspecialidadesByEstablecimiento = async (establecimientoId) => {
    if (!establecimientoId) return [];
    try {
        const res = await axios.get(`/api/especialidades/establecimiento/${establecimientoId}`);
        return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
        console.error('[EspecialidadesService] Error obteniendo especialidades del establecimiento:', error);
        throw error;
    }
};

/**
 * Obtiene la disponibilidad (horarios) de una especialidad en un establecimiento
 * @param {number} especialidadId
 * @param {number} establecimientoId
 */
export const getDisponibilidad = async (especialidadId, establecimientoId) => {
    if (!especialidadId || !establecimientoId) return null;
    try {
        const res = await axios.get(
            `/api/especialidades/establecimiento/${establecimientoId}`
        );
        const lista = Array.isArray(res.data) ? res.data : [];
        // Buscar la especialidad específica con sus horarios disponibles
        const encontrada = lista.find(e => e.id === especialidadId);
        return encontrada || null;
    } catch (error) {
        console.error('[EspecialidadesService] Error obteniendo disponibilidad:', error);
        throw error;
    }
};

const especialidadesService = {
    getEspecialidades,
    getEspecialidadesByEstablecimiento,
    getDisponibilidad,
};

export default especialidadesService;