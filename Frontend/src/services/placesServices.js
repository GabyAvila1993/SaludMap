import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js';

/**
 * Obtiene profesionales y centros médicos cercanos a una posición
 * @param {Object} pos - Posición con lat y lng
 * @returns {Promise<Array>} Lista de profesionales/centros médicos
 */
export const fetchProfesionales = async (pos) => {
	const types = ['hospital', 'clinic', 'doctors', 'veterinary'].join(',');
	const url = buildApiUrl(`${API_ENDPOINTS.PLACES}?lat=${pos.lat}&lng=${pos.lng}&types=${types}&radius=3000`);
	console.log('[Turnos] fetching places ->', url);
	
	try {
		const res = await axios.get(url);
		const data = res.data;
		const resultados = Array.isArray(data) ? data : (data.lugares ?? data.elements ?? data.features ?? []);
		console.log('[Turnos] places respuesta, count =', resultados.length);
		return resultados;
	} catch (error) {
		console.error('[Turnos] Error al obtener lugares:', error);
		throw error;
	}
};
