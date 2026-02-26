// INICIO CAMBIO - Archivo: src/components/Map.jsx - Integración con servicios
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { MapContainer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; 
import axios from 'axios';
import locationService from '../services/locationService';
import SaveLocationModal from './SaveLocationModal';
import SavedLocationsList from './SavedLocationsList';
import OfflineTileLayer from './OfflineTileLayer';
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

export default function MapComponent() {
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
    const [showSidebar, setShowSidebar] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [showStatus, setShowStatus] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    // ── NUEVO: estado del menú hamburguesa móvil ──
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // Mostrar progreso durante descargas offline
    useEffect(() => {
        if (showStatus && downloadProgress > 0 && downloadProgress < 100) {
            setStatusMessage(`Descargando área... ${Math.round(downloadProgress)}%`);
        }
    }, [downloadProgress, showStatus]);

    // Cerrar menú móvil al hacer click fuera
    useEffect(() => {
        if (!showMobileMenu) return;
        const handleOutside = (e) => {
            if (!e.target.closest('.mobile-map-menu') && !e.target.closest('.mobile-map-toggle')) {
                setShowMobileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('touchstart', handleOutside);
        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('touchstart', handleOutside);
        };
    }, [showMobileMenu]);

    const mapRef = useRef(null);
    const unsubscribeRef = useRef(null);
    const lastUserInteractionAt = useRef(0);
    const userInteracting = useRef(false);

    // Hook de reseñas (solo si tenemos establecimiento)
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
            if (mapRef.current) {
                if (userInteracting.current) return;
                try {
                    mapRef.current.setView([event.detail.lat, event.detail.lng], 15, {
                        animate: true,
                        duration: 0.5
                    });
                } catch {
                    // noop
                }
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

    const handleLocationChange = async (location) => {
        setCurrentLocation(location);
        setError('');
        if (mapRef.current) {
            try {
                if (userInteracting.current) return;
                const center = mapRef.current.getCenter();
                const dist = center ? center.distanceTo(L.latLng(location.lat, location.lng)) : Infinity;
                const DISTANCE_THRESHOLD = 25;
                if (dist < DISTANCE_THRESHOLD) return;
                mapRef.current.setView([location.lat, location.lng], 15, {
                    animate: true,
                    duration: 0.5
                });
            } catch {
                // noop
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
                    const offlinePlaces = await getNearbyPlaces(location);
                    places = offlinePlaces;
                    setOfflineMode(true);
                }
            } else {
                const offlinePlaces = await getNearbyPlaces(location);
                places = offlinePlaces;
                setOfflineMode(true);
            }
            setLugares(places);
        } catch (error) {
            console.error('Error obteniendo lugares:', error);
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
        setShowMobileMenu(false);
        setShowStatus(true);
        setStatusMessage('Actualizando ubicación...');
        setIsCalibrating(true);
        setError('Obteniendo ubicación GPS...');
        try {
            const location = await locationService.calibratePosition();
            if (mapRef.current && location) {
                if (!userInteracting.current) {
                    mapRef.current.setView([location.lat, location.lng], 15, {
                        animate: true, duration: 0.5
                    });
                }
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
        setShowMobileMenu(false);
        setShowStatus(true);
        setStatusMessage('Reactivando GPS...');
        setIsCalibrating(true);
        setError('Reactivando GPS...');
        try {
            const location = await locationService.calibratePosition();
            try { locationService.startWatching(); } catch { /* noop */ }
            if (mapRef.current && location) {
                if (!userInteracting.current) {
                    mapRef.current.setView([location.lat, location.lng], 15, {
                        animate: true, duration: 0.5
                    });
                }
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
        setShowMobileMenu(false);
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
        } catch (error) {
            console.error('Error cargando establecimiento:', error);
            setSelectedEstablecimiento(null);
        } finally {
            setLoadingEstablecimiento(false);
        }
    };

    const handlePlaceClose = () => {
        setSelectedPlace(null);
        setSelectedEstablecimiento(null);
    };

    const MapController = () => {
        const map = useMap();
        useEffect(() => {
            mapRef.current = map;
            try {
                setTimeout(() => {
                    if (map && typeof map.invalidateSize === 'function') {
                        map.invalidateSize();
                    }
                }, 50);
            } catch {
                // noop
            }
            const onUserInteractionStart = () => {
                userInteracting.current = true;
                lastUserInteractionAt.current = Date.now();
            };
            const onUserInteractionEnd = () => {
                lastUserInteractionAt.current = Date.now();
                setTimeout(() => {
                    if (Date.now() - lastUserInteractionAt.current > 1200) {
                        userInteracting.current = false;
                    }
                }, 1200);
            };
            try {
                map.on('movestart', onUserInteractionStart);
                map.on('zoomstart', onUserInteractionStart);
                map.on('moveend', onUserInteractionEnd);
                map.on('zoomend', onUserInteractionEnd);
            } catch {
                // noop
            }
            return () => {
                try {
                    map.off('movestart', onUserInteractionStart);
                    map.off('zoomstart', onUserInteractionStart);
                    map.off('moveend', onUserInteractionEnd);
                    map.off('zoomend', onUserInteractionEnd);
                } catch {
                    // noop
                }
            };
        }, [map]);
        return null;
    };

    const handleSaveLocation = async (locationData) => {
        try {
            await saveNamedLocation(
                locationData.name,
                locationData.lat,
                locationData.lng,
                locationData.description
            );
            setError(`Ubicación "${locationData.name}" guardada exitosamente`);
        } catch (error) {
            console.error('Error saving location:', error);
            throw new Error('Error al guardar la ubicación: ' + error.message);
        }
    };

    if (!currentLocation) {
        return (
            <div className="map-section">
                <div className="map-root">
                    <h3 className="map-title">Obteniendo ubicación...</h3>
                    {error && <div className="map-error">{error}</div>}
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="map-section">
            <div className="map-root">
                {!isOnline && <div className="offline-badge">{t('map.offline')}</div>}
                {error && <div className="map-error">{error}</div>}

                {/* ── DESKTOP: pill de controles (visible solo en > 1024px) ── */}
                <div className="map-controls">
                    <button onClick={handleCalibrate} disabled={isCalibrating}>
                        {isCalibrating ? t('map.updating') : t('map.updateLocation')}
                    </button>
                    {currentLocation?.source === 'manual' && (
                        <button onClick={handleReturnToGPS} disabled={isCalibrating} className="btn-return-gps">
                            Volver a GPS
                        </button>
                    )}
                    <button onClick={handleDownloadOffline}>
                        {t('map.downloadOfflineArea')}
                    </button>
                    <button onClick={() => setShowSaveLocationModal(true)} className="btn-save-location">
                        {t('map.saveLocation')}
                    </button>
                    <button onClick={() => setShowSavedLocationsList(true)} className="btn-view-locations">
                        {t('map.viewLocations')}
                    </button>
                    <button onClick={() => setShowFiltersModal(true)} className="btn-show-filters">
                        {t('map.filters.title') || 'Filtros'}
                    </button>
                    {downloadProgress > 0 && downloadProgress < 100 && (
                        <div className="progress">{t('map.downloading')}: {Math.round(downloadProgress)}%</div>
                    )}
                </div>

                {/* ── MÓVIL: botón hamburguesa (visible solo en ≤ 1024px) ── */}
                <button
                    className="mobile-map-toggle"
                    onClick={() => setShowMobileMenu(prev => !prev)}
                    aria-label="Menú del mapa"
                    aria-expanded={showMobileMenu}
                >
                    <span className={`mobile-map-toggle-icon ${showMobileMenu ? 'open' : ''}`}>
                        {showMobileMenu ? '✕' : '☰'}
                    </span>
                </button>

                {/* ── MÓVIL: panel drawer ── */}
                {showMobileMenu && (
                    <div className="mobile-map-menu" role="menu">
                        <div className="mobile-map-menu-header">
                            <span className="mobile-map-menu-title">Opciones del mapa</span>
                        </div>
                        <div className="mobile-map-menu-body">
                            <button
                                className="mobile-map-menu-btn"
                                onClick={handleCalibrate}
                                disabled={isCalibrating}
                            >
                                <span className="mobile-map-menu-btn-icon">📍</span>
                                {isCalibrating ? t('map.updating') : t('map.updateLocation')}
                            </button>
                            {currentLocation?.source === 'manual' && (
                                <button
                                    className="mobile-map-menu-btn mobile-map-menu-btn--gps"
                                    onClick={handleReturnToGPS}
                                    disabled={isCalibrating}
                                >
                                    <span className="mobile-map-menu-btn-icon">🛰️</span>
                                    Volver a GPS
                                </button>
                            )}
                            <button
                                className="mobile-map-menu-btn"
                                onClick={handleDownloadOffline}
                            >
                                <span className="mobile-map-menu-btn-icon">⬇️</span>
                                {t('map.downloadOfflineArea')}
                            </button>
                            <button
                                className="mobile-map-menu-btn"
                                onClick={() => { setShowSaveLocationModal(true); setShowMobileMenu(false); }}
                            >
                                <span className="mobile-map-menu-btn-icon">💾</span>
                                {t('map.saveLocation')}
                            </button>
                            <button
                                className="mobile-map-menu-btn"
                                onClick={() => { setShowSavedLocationsList(true); setShowMobileMenu(false); }}
                            >
                                <span className="mobile-map-menu-btn-icon">📋</span>
                                {t('map.viewLocations')}
                            </button>
                            <button
                                className="mobile-map-menu-btn mobile-map-menu-btn--filters"
                                onClick={() => { setShowFiltersModal(true); setShowMobileMenu(false); }}
                            >
                                <span className="mobile-map-menu-btn-icon">🔍</span>
                                {t('map.filters.title') || 'Filtros'}
                            </button>

                            {/* Progreso de descarga dentro del menú */}
                            {downloadProgress > 0 && downloadProgress < 100 && (
                                <div className="mobile-map-menu-progress">
                                    <div className="mobile-map-menu-progress-bar">
                                        <div
                                            className="mobile-map-menu-progress-fill"
                                            style={{ width: `${downloadProgress}%` }}
                                        />
                                    </div>
                                    <span>{t('map.downloading')}: {Math.round(downloadProgress)}%</span>
                                </div>
                            )}
                        </div>

                        {/* Precisión al pie del drawer */}
                        <div className="mobile-map-menu-footer">
                            <div className="mobile-map-menu-accuracy">
                                <span className="mobile-map-menu-accuracy-label">Precisión</span>
                                <span className="mobile-map-menu-accuracy-value">
                                    {currentLocation.accuracy
                                        ? `~${Math.round(currentLocation.accuracy)}${t('map.meters')}`
                                        : '—'}
                                </span>
                                <span className="mobile-map-menu-accuracy-source">
                                    {currentLocation.source === 'manual'
                                        ? t('map.locationSource.manual')
                                        : currentLocation.source === 'calibrated'
                                        ? t('map.locationSource.calibrated')
                                        : t('map.locationSource.gps')}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cartel de estado */}
                <div className={`status-overlay ${showStatus ? 'show' : ''}`}>{statusMessage}</div>

                {/* Precisión en desktop (visible solo en > 1024px) */}
                <div className="map-info">
                    {t('map.accuracy')}: {currentLocation.accuracy ? `${Math.round(currentLocation.accuracy)}${t('map.meters')}` : '—'}
                    <span className="location-source">
                        ({currentLocation.source === 'manual' ? t('map.locationSource.manual') :
                            currentLocation.source === 'calibrated' ? t('map.locationSource.calibrated') : t('map.locationSource.gps')})
                    </span>
                </div>

                <div className="map-layout">
                    <div className="map-wrapper">
                        <MapContainer
                            center={[currentLocation.lat, currentLocation.lng]}
                            zoom={15}
                            className="leaflet-map"
                            whenCreated={(mapInstance) => { mapRef.current = mapInstance }}
                            onClick={handlePlaceClose}
                        >
                            <MapController />
                            <OfflineTileLayer 
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {currentLocation.accuracy && (
                                <Circle
                                    center={[currentLocation.lat, currentLocation.lng]}
                                    radius={currentLocation.accuracy}
                                    pathOptions={{ color: 'var(--path-highlight, #007bff)', fillOpacity: 0.08 }}
                                />
                            )}
                            <Marker
                                position={[currentLocation.lat, currentLocation.lng]}
                                icon={userIcon}
                                draggable={true}
                                eventHandlers={{ dragend: handleMarkerDrag }}
                            />
                            {visibleLugares.map((lugar, index) => {
                                const lat = lugar.lat ?? lugar.center?.lat ?? lugar.geometry?.coordinates?.[1] ?? lugar.latitude ?? lugar.y ?? lugar.center?.latitude;
                                const lng = lugar.lng ?? lugar.lon ?? lugar.center?.lon ?? lugar.geometry?.coordinates?.[0] ?? lugar.longitude ?? lugar.x ?? lugar.center?.longitude;
                                if (lat == null || lng == null) return null;
                                const coords = [lat, lng];
                                const nombre = lugar.tags?.name ?? lugar.properties?.name ??
                                        lugar.tags?.amenity ?? 'Servicio de salud';
                                const direccion = lugar.tags?.addr_full ?? lugar.tags?.address ??
                                    lugar.properties?.address ?? '';
                                const tipo = lugar.type || 'default';
                                return (
                                    <Marker
                                        key={index}
                                        position={coords}
                                        icon={getIconForType(tipo)}
                                        title={nombre}
                                        alt={direccion}
                                        eventHandlers={{
                                            click: () => { handlePlaceSelect(lugar); }
                                        }}
                                    />
                                );
                            })}
                        </MapContainer>
                        {selectedPlace && (
                            <EstablishmentInfo place={selectedPlace} onClose={handlePlaceClose} />
                        )}
                    </div>
                    {/* Modal de filtros */}
                        {showFiltersModal && (typeof document !== 'undefined' ? ReactDOM.createPortal(
                            <div className="filter-modal show" role="dialog" aria-modal="true">
                                <h4 className="filters-title">{t('map.filters.title') || 'Filtros'}</h4>
                                <div className="filters-vertical">
                                    <button type="button" className={`filter-btn filter-all-btn ${Object.values(filters).every(Boolean) ? 'active' : ''}`} onClick={toggleAllFilters}>
                                        Todos
                                    </button>
                                    <button type="button" className={`filter-btn filter-hospital ${filters.hospital ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, hospital: !f.hospital }))}>
                                        🏥 Hospital
                                    </button>
                                    <button type="button" className={`filter-btn filter-clinica ${filters.clinic ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, clinic: !f.clinic }))}>
                                        🏩 Clínica
                                    </button>
                                    <button type="button" className={`filter-btn filter-doctor ${filters.doctors ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, doctors: !f.doctors }))}>
                                        👨‍⚕️ Médico
                                    </button>
                                    <button type="button" className={`filter-btn filter-veterinaria ${filters.veterinary ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, veterinary: !f.veterinary }))}>
                                        🐾 Veterinaria
                                    </button>
                                </div>
                                <div className="filter-modal-actions">
                                    <button className="btn btn-secondary" onClick={() => setShowFiltersModal(false)}>Cerrar</button>
                                    <button className="btn btn-primary" onClick={() => setShowFiltersModal(false)}>Aplicar</button>
                                </div>
                            </div>, document.body) : null)}
                </div>

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
            </div>
        </div>

        {/* Sección de reseñas FUERA del contenedor del mapa */}
        {selectedPlace && selectedEstablecimiento && (
            <div className="resenias-section">
                <div className="resenias-header-info">
                    <h3 className="resenias-title">
                        Reseñas de {selectedPlace.tags?.name ?? selectedPlace.properties?.name ?? 'este lugar'}
                    </h3>
                </div>
                {loadingEstablecimiento ? (
                    <div className="resenias-loading">Cargando reseñas...</div>
                ) : (
                    <Resenias 
                        resenias={resenias}
                        promedioEstrellas={promedioEstrellas}
                        totalResenias={totalResenias}
                        loading={loadingResenias}
                    />
                )}
            </div>
        )}
        </>
    );
}
// FIN CAMBIO - Archivo: src/components/Map.jsx