import axios from 'axios';

export const fetchProfesionales = async (pos) => {
    const types = ['hospital', 'clinic', 'doctors', 'veterinary'].join(',');
    const url = `/places?lat=${pos.lat}&lng=${pos.lng}&types=${types}&radius=3000`;
    console.log('[Turnos] fetching places ->', url);
    const res = await axios.get(url);
    const data = res.data;
    const resultados = Array.isArray(data) ? data : (data.lugares ?? data.elements ?? data.features ?? []);
    console.log('[Turnos] places respuesta, count =', resultados.length);
    return resultados;
};