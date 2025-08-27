import axios from 'axios';

export const saveAppointment = async (payload) => {
    const response = await axios.post('/turnos', payload);
    console.log('[DEBUG] ✅ Turno guardado en backend:', response.data);
    return response.data;
};

export const fetchMisTurnos = async (correo) => {
    if (!correo) {
        console.log('[DEBUG] No hay correo, retornando array vacío');
        return [];
    }

    console.log('[DEBUG] Fetching turnos para:', correo);
    const res = await axios.get(`/turnos?user=${encodeURIComponent(correo)}`);
    const data = res.data;
    console.log('[DEBUG] Respuesta completa del servidor:', data);

    const arr = Array.isArray(data) ? data : (Array.isArray(data?.turnos) ? data.turnos : []);
    console.log('[DEBUG] Turnos procesados:', arr);
    return arr;
};

export const cancelAppointment = async (id) => {
    console.log('[Turnos] cancelarTurno called, id=', id);
    if (!id) {
        throw new Error('No se pudo cancelar: id de turno inexistente');
    }

    const url = `/turnos/${encodeURIComponent(id)}`;
    console.log('[Turnos] PUT', url);
    const res = await axios.put(url, { action: 'cancel' });
    console.log('[Turnos] respuesta cancel completa:', res);
    return res;
};