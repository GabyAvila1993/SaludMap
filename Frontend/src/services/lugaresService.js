import axios from 'axios';

const distanceMeters = (a, b) => {
    if (!a || !b) return Infinity;
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const aa = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c;
};

const getLugaresCercanos = async (pos) => {
    const types = ['hospital', 'clinic', 'doctors', 'veterinary'].join(',');
    const url = `/places?lat=${pos.lat}&lng=${pos.lng}&types=${types}&radius=3000`;
    const res = await axios.get(url);
    const data = res.data;
    return Array.isArray(data) ? data : (data.lugares ?? data.elements ?? data.features ?? []);
};

export default { getLugaresCercanos, distanceMeters };
