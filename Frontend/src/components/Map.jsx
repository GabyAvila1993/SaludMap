// INICIO CAMBIO - Archivo: src/components/Map.jsx - Integración con Navbar Global
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; 
import axios from 'axios';
import locationService from '../services/locationService';
import SaveLocationModal from './SaveLocationModal';
import SavedLocationsList from './SavedLocationsList';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import offlineTileService from '../services/offlineTileService.js';
import { savePlaces, getNearbyPlaces, saveNamedLocation } from '../services/db.js';
import './Map.css';
import EstablishmentInfo from './EstablishmentInfo';
import Resenias from './Resenias/Resenias';
import { useResenias } from '../hooks/useResenias';
import establecimientosService from '../services/establecimientosService';

// Fix ícono por defecto
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

export default function MapComponent({ onEstablishmentSelect }) {
    const { t } = useTranslation();
    const [currentLocation, setCurrentLocation] = useState(null);
    const [lugares, setLugares] = useState([]);
    const [error, setError] = useState('');
    const [isCalibrating, setIsCalibrating] = useState(false);
    const [_offlineMode, setOfflineMode] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Filtros para tipos de establecimientos
    const [filters, setFilters] = useState({
        hospital: true,
        clinic: true,
        doctors: true,
        veterinary: true
    });

    const toggleAllFilters = () => {
        const allActive = Object.values(filters).every(Boolean);
        setFilters({ hospital: !allActive, clinic: !allActive, doctors: !allActive, veterinary: !allActive });
    };

    const [downloadProgress, setDownloadProgress] = useState(0);
    const [showSaveLocationModal, setShowSaveLocationModal] = useState(false);
    const [showSavedLocationsList, setShowSavedLocationsList] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [selectedEstablecimiento, setSelectedEstablecimiento] = useState(null);
    const [loadingEstablecimiento, setLoadingEstablecimiento] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [showStatus, setShowStatus] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    // Mostrar progreso durante descargas offline
    useEffect(() => {
        if (showStatus && downloadProgress > 0 && downloadProgress < 100) {
            setStatusMessage(`${t('map.downloading')}: ${Math.round(downloadProgress)}%`);
        }
    }, [downloadProgress, showStatus, t]);

    const mapRef = useRef(null);
    const unsubscribeRef = useRef(null);
    const lastUserInteractionAt = useRef(0);
    const userInteracting = useRef(false);

    // Hook de reseñas
    const { resenias, loading: loadingResenias, promedioEstrellas, totalResenias } = 
        useResenias(selectedEstablecimiento?.id);

    // Icono para usuario
    const userIcon = L.divIcon({
        html: `<div class="user-icon"></div>`,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
    });

    // Iconos por tipo
    const iconDefs = {
        hospital: { key: 'hospital', color: 'var(--marker-hospital, #e74c3c)', label: 'H' },
        clinic: { key: 'clinica', color: 'var(--marker-clinic, #3498db)', label: 'C' },
        doctors: { key: 'doctor', color: 'var(--marker-doctors, #2ecc71)', label: 'D' },
        veterinary: { key: 'veterinaria', color: 'var(--marker-vet, #9b59b6)', label: 'V' },
        default: { key: 'default', color: 'var(--marker-default, #34495e)', label: '?' },
    };

    const createDivIcon = (key, label) => {
        const html = `<div class="marker-div-icon marker-${key}">${label}</div>`;
        return L.divIcon({ html, className: '', iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36] });
    };

    const iconCache = {};
    const getIconForType = (type) => {
        const def = iconDefs[type] ?? iconDefs.default;
        const key = def.key || 'default';
        if (!iconCache[key]) iconCache[key] = createDivIcon(key, def.label);
        return iconCache[key];
    };

    // Configurar servicios al montar componente
    useEffect(() => {
        const unsubscribe = locationService.subscribe(handleLocationChange);
        unsubscribeRef.current = unsubscribe;
        offlineTileService.setProgressCallback(setDownloadProgress);
        locationService.loadLastKnownLocation();
        locationService.startWatching();

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        
        const handleCenterMap = (event) => {
            if (mapRef.current && !userInteracting.current) {
                try {
                    mapRef.current.setView([event.detail.lat, event.detail.lng], 15, { animate: true, duration: 0.5 });
                } catch { /* noop */ }
            }
        };
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('centerMapOnLocation', handleCenterMap);

        return () => {
            if (unsubscribeRef.current) unsubscribeRef.current();
            locationService.stopWatching();
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('centerMapOnLocation', handleCenterMap);
        };
    }, []);

    // ── NUEVO: Escuchar órdenes del Navbar Global ──
    const actionHandlerRef = useRef(null);
    actionHandlerRef.current = (action) => {
        switch(action) {
            case 'calibrate': handleCalibrate(); break;
            case 'return-gps': handleReturnToGPS(); break;
            case 'download-offline': handleDownloadOffline(); break;
            case 'save-location': setShowSaveLocationModal(true); break;
            case 'view-locations': setShowSavedLocationsList(true); break;
            case 'filters': setShowFiltersModal(true); break;
            default: break;
        }
    };

    useEffect(() => {
        const listener = (e) => {
            if (actionHandlerRef.current) actionHandlerRef.current(e.detail);
        };
        window.addEventListener('map-action', listener);
        return () => window.removeEventListener('map-action', listener);
    }, []);

    const handleLocationChange = async (location) => {
        // Solo actualizar si la ubicación no fue establecida manualmente por el usuario
        if (currentLocation?.source !== 'manual') {
            setCurrentLocation(location);
            setError('');
            if (mapRef.current && !userInteracting.current) {
                try {
                    const center = mapRef.current.getCenter();
                    const dist = center ? center.distanceTo(L.latLng(location.lat, location.lng)) : Infinity;
                    if (dist >= 25) {
                        mapRef.current.setView([location.lat, location.lng], 15, { animate: true, duration: 0.5 });
                    }
                } catch { /* noop */ }
            }
        }
        await fetchNearbyPlaces(location);
    };

    const fetchNearbyPlaces = async (location) => {
        try {
            let places = [];
            if (isOnline) {
                try {
                    const selectedTypes = Object.keys(filters).filter(k => filters[k]);
                    const types = selectedTypes.join(',') || 'hospital,clinic,doctors,veterinary';
                    const response = await axios.get(
                        `/api/places?lat=${location.lat}&lng=${location.lng}&types=${types}`
                    );
                    places = normalizeApiResponse(response.data);
                    if (places.length > 0) await savePlaces(places);
                    setOfflineMode(false);
                } catch {
                    places = await getNearbyPlaces(location);
                    setOfflineMode(true);
                }
            } else {
                places = await getNearbyPlaces(location);
                setOfflineMode(true);
            }
            setLugares(places);
        } catch (error) {
            const cachedPlaces = await getNearbyPlaces(location);
            if (cachedPlaces.length > 0) {
                setLugares(cachedPlaces);
                setOfflineMode(true);
                setError('Modo offline: mostrando lugares guardados');
            } else {
                setError('Error de conexión y sin datos offline disponibles');
            }
        }
    };

    const visibleLugares = lugares.filter(l => {
        const tipo = l.type || l.tipo || 'default';
        return !!filters[tipo];
    });

    const normalizeApiResponse = (data) => {
        let results = [];
        if (Array.isArray(data)) results = data;
        else if (Array.isArray(data.lugares)) results = data.lugares;
        else if (Array.isArray(data.elements)) results = data.elements;
        else if (Array.isArray(data.features)) results = data.features;
        else results = data.elements ?? data.lugares ?? [];
        return results.map(place => ({
            ...place,
            lat: place.lat ?? place.center?.lat ?? place.geometry?.coordinates?.[1],
            lng: place.lng ?? place.lon ?? place.center?.lon ?? place.geometry?.coordinates?.[0],
            type: getTypeFromPlace(place)
        }));
    };

    const getTypeFromPlace = (place) => {
        const tags = place.tags ?? place.properties ?? {};
        const amenity = (tags.amenity || tags.healthcare || '').toString().toLowerCase();
        const name = (tags.name || '').toString().toLowerCase();
        if (amenity.includes('hospital') || name.includes('hospital')) return 'hospital';
        if (amenity.includes('clinic') || name.includes('clínica') || name.includes('clinic')) return 'clinic';
        if (amenity.includes('veterinary') || name.includes('veterin')) return 'veterinary';
        if (amenity.includes('doctor') || name.includes('doctor') || name.includes('médic')) return 'doctors';
        return 'default';
    };

    const handleCalibrate = async () => {
        if (isCalibrating) return;
        setShowStatus(true);
        setStatusMessage('Actualizando ubicación...');
        setIsCalibrating(true);
        setError('Obteniendo ubicación GPS...');
        try {
            const location = await locationService.calibratePosition();
            if (mapRef.current && location && !userInteracting.current) {
                mapRef.current.setView([location.lat, location.lng], 15, { animate: true, duration: 0.5 });
            }
            setError('Ubicación actualizada exitosamente');
        } catch (error) {
            setError('Error actualizando ubicación: ' + error.message);
        } finally {
            setIsCalibrating(false);
            setShowStatus(false);
            setStatusMessage('');
        }
    };

    const handleReturnToGPS = async () => {
        if (isCalibrating) return;
        setShowStatus(true);
        setStatusMessage('Reactivando GPS...');
        setIsCalibrating(true);
        setError('Reactivando GPS...');
        try {
            const location = await locationService.calibratePosition();
            try { locationService.startWatching(); } catch { /* noop */ }
            if (mapRef.current && location && !userInteracting.current) {
                mapRef.current.setView([location.lat, location.lng], 15, { animate: true, duration: 0.5 });
            }
            setError('GPS reactivado');
        } catch (error) {
            setError('No se pudo reactivar GPS: ' + (error.message || String(error)));
        } finally {
            setIsCalibrating(false);
            setShowStatus(false);
            setStatusMessage('');
        }
    };

    const handleDownloadOffline = async () => {
        if (!currentLocation) return;
        try {
            setShowStatus(true);
            setStatusMessage('Descargando área...');
            setError('Descargando mapa para uso offline...');
            await offlineTileService.downloadTilesForArea(currentLocation);
            setError('Área descargada para uso offline');
        } catch (error) {
            setError('Error descargando área offline: ' + error.message);
        } finally {
            setShowStatus(false);
            setStatusMessage('');
        }
    };

    const handleMarkerDrag = async (event) => {
        const { lat, lng } = event.target.getLatLng();
        await locationService.setManualLocation(lat, lng);
    };

    const handlePlaceSelect = async (lugar) => {
        setSelectedPlace(lugar);
        setLoadingEstablecimiento(true);
        try {
            const est = await establecimientosService.findOrCreate(lugar);
            setSelectedEstablecimiento(est);
            if (onEstablishmentSelect) onEstablishmentSelect(est); // Notificamos a App.jsx
        } catch (error) {
            console.error('Error cargando establecimiento:', error);
            setSelectedEstablecimiento(null);
            if (onEstablishmentSelect) onEstablishmentSelect(null);
        } finally {
            setLoadingEstablecimiento(false);
        }
    };

    const handlePlaceClose = () => {
        setSelectedPlace(null);
        setSelectedEstablecimiento(null);
        if (onEstablishmentSelect) onEstablishmentSelect(null);
    };

    const MapController = () => {
        const map = useMap();
        useEffect(() => {
            mapRef.current = map;
            try { setTimeout(() => { if (map && typeof map.invalidateSize === 'function') map.invalidateSize(); }, 50); } catch { /* noop */ }
            
            const onUserInteractionStart = () => {
                userInteracting.current = true;
                lastUserInteractionAt.current = Date.now();
            };
            const onUserInteractionEnd = () => {
                lastUserInteractionAt.current = Date.now();
                setTimeout(() => { if (Date.now() - lastUserInteractionAt.current > 1200) userInteracting.current = false; }, 1200);
            };
            
            try {
                map.on('movestart', onUserInteractionStart);
                map.on('zoomstart', onUserInteractionStart);
                map.on('moveend', onUserInteractionEnd);
                map.on('zoomend', onUserInteractionEnd);
            } catch { /* noop */ }
            
            return () => {
                try {
                    map.off('movestart', onUserInteractionStart);
                    map.off('zoomstart', onUserInteractionStart);
                    map.off('moveend', onUserInteractionEnd);
                    map.off('zoomend', onUserInteractionEnd);
                } catch { /* noop */ }
            };
        }, [map]);
        return null;
    };

    const handleSaveLocation = async (locationData) => {
        try {
            await saveNamedLocation(locationData.name, locationData.lat, locationData.lng, locationData.description);
            setError(`Ubicación "${locationData.name}" guardada exitosamente`);
        } catch (error) {
            throw new Error('Error al guardar la ubicación: ' + error.message);
        }
    };

    if (!currentLocation) {
        return (
            <div className="map-section">
                <div className="map-root">
                    <h3 className="map-title">{t('common.loading', 'Obteniendo ubicación...')}</h3>
                    {error && <div className="map-error">{error}</div>}
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="map-section">
            <div className="map-root">
                {!isOnline && <div className="offline-badge">{t('map.offline', '(Offline)')}</div>}
                {error && <div className="map-error">{error}</div>}

                {/* Cartel de estado superior */}
                <div className={`status-overlay ${showStatus ? 'show' : ''}`}>{statusMessage}</div>

                {/* Info de precisión (esquina inferior izquierda) */}
                <div className="map-info">
                    {t('map.accuracy', 'Precisión')}: {currentLocation.accuracy ? `${Math.round(currentLocation.accuracy)}m` : '—'}
                    <span className="location-source">
                        ({currentLocation.source === 'manual' ? t('map.locationSource.manual', 'Manual') :
                            currentLocation.source === 'calibrated' ? t('map.locationSource.calibrated', 'Calibrado') : t('map.locationSource.gps', 'GPS')})
                    </span>
                </div>

                {/* CONTENIDO DEL MAPA */}
                <div className="map-wrapper">
                    <MapContainer
                        center={[currentLocation.lat, currentLocation.lng]}
                        zoom={15}
                        className="leaflet-map"
                    >
                        <TileLayer 
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker
                            position={[currentLocation.lat, currentLocation.lng]}
                            icon={userIcon}
                            draggable={true}
                            eventHandlers={{ dragend: handleMarkerDrag }}
                        />
                        {currentLocation.accuracy && (
                            <Circle 
                                center={[currentLocation.lat, currentLocation.lng]} 
                                radius={currentLocation.accuracy} 
                                pathOptions={{ color: 'var(--path-highlight, #007bff)', fillOpacity: 0.08 }}
                            />
                        )}
                        {visibleLugares.map((lugar, idx) => (
                            <Marker
                                key={lugar.id || `${lugar.lat}-${lugar.lng}-${idx}`}
                                position={[lugar.lat, lugar.lng]}
                                icon={getIconForType(lugar.type)}
                                eventHandlers={{ click: () => handlePlaceSelect(lugar) }}
                            />
                        ))}
                        <MapController />
                    </MapContainer>
                </div>

                {/* ── MODALES DEL MAPA ── */}
                <SaveLocationModal
                    isOpen={showSaveLocationModal}
                    onClose={() => setShowSaveLocationModal(false)}
                    onSave={handleSaveLocation}
                    currentLocation={currentLocation}
                />
                
                <SavedLocationsList
                    isOpen={showSavedLocationsList}
                    onClose={() => setShowSavedLocationsList(false)}
                />

                {showFiltersModal && (typeof document !== 'undefined' ? ReactDOM.createPortal(
                    <div className="filter-modal show" role="dialog" aria-modal="true">
                        <h4 className="filters-title">{t('map.filters.title', 'Filtros')}</h4>
                        <div className="filters-vertical">
                            <button type="button" className={`filter-btn filter-all-btn ${Object.values(filters).every(Boolean) ? 'active' : ''}`} onClick={toggleAllFilters}>
                                {t('map.filters.all', 'Todos')}
                            </button>
                            <button type="button" className={`filter-btn filter-hospital ${filters.hospital ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, hospital: !f.hospital }))}>
                                🏥 {t('map.filters.hospital', 'Hospital')}
                            </button>
                            <button type="button" className={`filter-btn filter-clinica ${filters.clinic ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, clinic: !f.clinic }))}>
                                🏩 {t('map.filters.clinic', 'Clínica')}
                            </button>
                            <button type="button" className={`filter-btn filter-doctor ${filters.doctors ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, doctors: !f.doctors }))}>
                                👨‍⚕️ {t('map.filters.doctors', 'Médico')}
                            </button>
                            <button type="button" className={`filter-btn filter-veterinaria ${filters.veterinary ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, veterinary: !f.veterinary }))}>
                                🐾 {t('map.filters.veterinary', 'Veterinaria')}
                            </button>
                        </div>
                        <div className="filter-modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowFiltersModal(false)}>Cerrar</button>
                            <button className="btn btn-primary" onClick={() => setShowFiltersModal(false)}>Aplicar</button>
                        </div>
                    </div>, document.body) : null)}

                {selectedPlace && (
                    <EstablishmentInfo
                        place={selectedPlace}
                        establecimiento={selectedEstablecimiento}
                        loading={loadingEstablecimiento}
                        onClose={handlePlaceClose}
                        resenias={resenias}
                        loadingResenias={loadingResenias}
                        promedioEstrellas={promedioEstrellas}
                        totalResenias={totalResenias}
                    />
                )}

            </div>
        </div>
        </>
    );
}