import { useState, useEffect } from 'react';

export function useGeolocalizacion() {
    const [pos, setPos] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((p) => {
            setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        }, () => { }, { enableHighAccuracy: false });
    }, []);

    useEffect(() => {
        const handler = (e) => {
            const d = e.detail;
            if (d?.lat && d?.lng) {
                setPos({ lat: d.lat, lng: d.lng });
            }
        };
        window.addEventListener('saludmap:pos-changed', handler);
        return () => {
            window.removeEventListener('saludmap:pos-changed', handler);
        };
    }, []);

    return pos;
}
