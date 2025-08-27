import { useState, useEffect } from 'react';

export const useGeolocation = () => {
    const [pos, setPos] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((p) => {
            setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        }, () => { }, { enableHighAccuracy: false });
    }, []);

    return { pos, setPos };
};