import axios from 'axios';

const getMisTurnos = async () => {
    const res = await axios.get('/turnos?user=usuario');
    const data = res.data;
    return Array.isArray(data) ? data : (Array.isArray(data?.turnos) ? data.turnos : []);
};

const solicitarTurno = async (payload) => {
    await axios.post('/turnos', payload);
};

const cancelarTurno = async (id) => {
    const url = `/turnos/${encodeURIComponent(id)}`;
    await axios.put(url, { action: 'cancel' });
};

export default { getMisTurnos, solicitarTurno, cancelarTurno };
