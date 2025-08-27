export const distanceMeters = (a, b) => {
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

// detectar tipo a partir del objeto place (misma heurística que en Map.jsx)
export const getTypeFromPlace = (place) => {
    const tags = place?.tags ?? place?.properties ?? {};
    const amenity = (tags.amenity || tags.healthcare || '').toString().toLowerCase();
    if (amenity.includes('hospital')) return 'hospital';
    if (amenity.includes('clinic')) return 'clinic';
    if (amenity.includes('veterinary')) return 'veterinary';
    if (amenity.includes('doctor') || amenity.includes('doctors')) return 'doctors';
    const name = (tags.name || '').toString().toLowerCase();
    if (name.includes('hospital')) return 'hospital';
    if (name.includes('clinica') || name.includes('clinic')) return 'clinic';
    if (name.includes('veterin') || name.includes('vet')) return 'veterinary';
    if (name.includes('dr ') || name.includes('doctor') || name.includes('médic') || name.includes('medic')) return 'doctors';
    return 'default';
};

export const prettyType = (t) => {
    if (!t) return 'Servicio';
    return { hospital: 'Hospital', clinic: 'Clínica', doctors: 'Doctor', veterinary: 'Veterinaria', default: 'Servicio' }[t] ?? t;
};