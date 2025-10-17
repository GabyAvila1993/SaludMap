// INICIO CAMBIO - Archivo: src/components/Map.jsx - Integración con servicios

import React, { useState, useEffect, useRef } from 'react';
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
    const [offlineMode, setOfflineMode] = useState(false);
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
        hospital: { color: '#e74c3c', label: 'H' },
        clinic: { color: '#3498db', label: 'C' },
        doctors: { color: '#2ecc71', label: 'D' },
        veterinary: { color: '#9b59b6', label: 'V' },
        default: { color: '#34495e', label: '?' },
    };

    const createDivIcon = (color, label) => {
        const html = `<div style="
      display:flex;align-items:center;justify-content:center;
      width:36px;height:36px;border-radius:18px;background:${color};
      color:#fff;font-weight:700;box-shadow:0 1px 4px rgba(0,0,0,0.6);
      border:2px solid rgba(255,255,255,0.6);
    ">${label}</div>`;
        return L.divIcon({ html, className: '', iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36] });
    };

    const iconCache = {};
    const getIconForType = (type) => {
        const def = iconDefs[type] ?? iconDefs.default;
        const key = `${def.color}-${def.label}`;
        if (!iconCache[key]) iconCache[key] = createDivIcon(def.color, def.label);
        return iconCache[key];
    };

    // Configurar servicios al montar componente
    useEffect(() => {
        // Suscribirse a cambios de ubicación
        const unsubscribe = locationService.subscribe(handleLocationChange);
        unsubscribeRef.current = unsubscribe;

        // Configurar callback de progreso de descarga offline
        offlineTileService.setProgressCallback(setDownloadProgress);

        // Cargar última ubicación conocida
        locationService.loadLastKnownLocation();

        // Iniciar seguimiento de ubicación
        locationService.startWatching();

        // Detectar cambios de conectividad
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        
        // Escuchar evento para centrar mapa
        const handleCenterMap = (event) => {
            if (mapRef.current) {
                // No forzamos recentrado si el usuario está interactuando
                if (userInteracting.current) return;
                try {
                    mapRef.current.setView([event.detail.lat, event.detail.lng], 15, {
                        animate: true,
                        duration: 0.5
                    });
                } catch (e) {
                    // noop
                }
            }
        };
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('centerMapOnLocation', handleCenterMap);

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
            locationService.stopWatching();
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('centerMapOnLocation', handleCenterMap);
        };
    }, []);

    // Manejar cambios de ubicación
    const handleLocationChange = async (location) => {
        setCurrentLocation(location);
        setError('');

        // Centrar mapa en nueva ubicación con animación
        if (mapRef.current) {
            try {
                // No re-centremos si el usuario está interactuando con el mapa
                if (userInteracting.current) return;

                // Si la distancia al centro actual es muy pequeña, evitamos hacer setView para no provocar zoom/ajustes innecesarios
                const center = mapRef.current.getCenter();
                const dist = center ? center.distanceTo(L.latLng(location.lat, location.lng)) : Infinity;
                const DISTANCE_THRESHOLD = 25; // metros
                if (dist < DISTANCE_THRESHOLD) return;

                // Usar un zoom razonable (15) para evitar zoom extremo
                mapRef.current.setView([location.lat, location.lng], 15, {
                    animate: true,
                    duration: 0.5
                });
            } catch (e) {
                // noop
            }
        }

        // Buscar lugares cercanos
        await fetchNearbyPlaces(location);
    };

    // Buscar lugares (online/offline)
    const fetchNearbyPlaces = async (location) => {
        try {
            let places = [];

            // Si estamos online, intentar buscar online primero
            if (isOnline) {
                try {
                    // Enviar sólo los tipos seleccionados por el usuario
                    const selectedTypes = Object.keys(filters).filter(k => filters[k]);
                    const types = selectedTypes.join(',') || 'hospital,clinic,doctors,veterinary';
                    const response = await axios.get(
                        `/api/places?lat=${location.lat}&lng=${location.lng}&types=${types}`
                    );

                    places = normalizeApiResponse(response.data);

                    // Guardar en IndexedDB para uso offline
                    if (places.length > 0) {
                        await savePlaces(places);
                    }
                    setOfflineMode(false);
                } catch (onlineError) {
                    console.log('Error en búsqueda online, usando cache offline');
                    // Si falla online, usar cache offline
                    const offlinePlaces = await getNearbyPlaces(location);
                    places = offlinePlaces;
                    setOfflineMode(true);
                }
            } else {
                // Si estamos offline, usar solo cache
                const offlinePlaces = await getNearbyPlaces(location);
                places = offlinePlaces;
                setOfflineMode(true);
            }

            setLugares(places);
        } catch (error) {
            console.error('Error obteniendo lugares:', error);

            // Intentar cargar desde cache offline
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

    // Obtener array de lugares filtrados a partir del filtro de UI
    const visibleLugares = lugares.filter(l => {
        const tipo = l.type || l.tipo || 'default';
        // Mostrar sólo si el tipo está seleccionado (si no está en filtros, ocultar)
        return !!filters[tipo];
    });

    // Normalizar respuesta de API
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

    // Determinar tipo de lugar
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

    // Actualizar ubicación
    const handleCalibrate = async () => {
        if (isCalibrating) return;

        setIsCalibrating(true);
        setError('Obteniendo ubicación GPS...');

        try {
            const location = await locationService.calibratePosition();
            // Forzar que el mapa se centre en la nueva ubicación
            if (mapRef.current && location) {
                if (!userInteracting.current) {
                    mapRef.current.setView([location.lat, location.lng], 15, {
                        animate: true,
                        duration: 0.5
                    });
                }
            }
            setError('Ubicación actualizada exitosamente');
        } catch (error) {
            setError('Error actualizando ubicación: ' + error.message);
        } finally {
            setIsCalibrating(false);
        }
    };

    // Volver a GPS cuando el usuario pasó a manual
    const handleReturnToGPS = async () => {
        if (isCalibrating) return;

        setIsCalibrating(true);
        setError('Reactivando GPS...');

        try {
            const location = await locationService.calibratePosition();
            // Asegurar que el watch vuelva a estar activo para actualizaciones automáticas
            try { locationService.startWatching(); } catch (e) { /* noop */ }

            if (mapRef.current && location) {
                if (!userInteracting.current) {
                    mapRef.current.setView([location.lat, location.lng], 15, {
                        animate: true,
                        duration: 0.5
                    });
                }
            }

            setError('GPS reactivado');
        } catch (error) {
            setError('No se pudo reactivar GPS: ' + (error.message || String(error)));
        } finally {
            setIsCalibrating(false);
        }
    };

    // Descargar área offline
    const handleDownloadOffline = async () => {
        if (!currentLocation) return;

        try {
            setError('Descargando mapa para uso offline...');
            await offlineTileService.downloadTilesForArea(currentLocation);
            setError('Área descargada para uso offline');
        } catch (error) {
            setError('Error descargando área offline: ' + error.message);
        }
    };

    // Manejar arrastre del marcador
    const handleMarkerDrag = async (event) => {
        const { lat, lng } = event.target.getLatLng();
        await locationService.setManualLocation(lat, lng);
    };

    // Manejar selección de lugar y cargar establecimiento
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

    // Manejar cierre de lugar seleccionado
    const handlePlaceClose = () => {
        setSelectedPlace(null);
        setSelectedEstablecimiento(null);
    };

    // Component to handle map reference
    const MapController = () => {
        const map = useMap();

        useEffect(() => {
            mapRef.current = map;

            // Force Leaflet to recalculate size and positions after mount.
            // This avoids errors like "Cannot read properties of undefined (reading '_leaflet_pos')"
            // which can happen when the map container changes size or becomes visible after render.
            try {
                setTimeout(() => {
                    if (map && typeof map.invalidateSize === 'function') {
                        map.invalidateSize();
                    }
                }, 50);
            } catch (e) {
                // noop
            }

            // Track user interactions to avoid fighting the user's pan/zoom actions.
            const onUserInteractionStart = () => {
                userInteracting.current = true;
                lastUserInteractionAt.current = Date.now();
            };
            const onUserInteractionEnd = () => {
                // keep interaction flag for a short grace period
                lastUserInteractionAt.current = Date.now();
                setTimeout(() => {
                    // only clear if no further interaction
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
            } catch (e) {
                // noop if events not available
            }

            return () => {
                try {
                    map.off('movestart', onUserInteractionStart);
                    map.off('zoomstart', onUserInteractionStart);
                    map.off('moveend', onUserInteractionEnd);
                    map.off('zoomend', onUserInteractionEnd);
                } catch (e) {
                    // noop
                }
            };
        }, [map]);

        return null;
    };

    // Manejar guardar ubicación con nombre
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
            <h3 className="map-title">
                {t('map.nearbyServicesMap')}
                {!isOnline && <span className="offline-badge"> {t('map.offline')}</span>}
            </h3>

            {error && <div className="map-error">{error}</div>}

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
                {/* filtros movidos a la barra lateral para mejor visibilidad */}
                {downloadProgress > 0 && downloadProgress < 100 && (
                    <div className="progress">{t('map.downloading')}: {Math.round(downloadProgress)}%</div>
                )}
            </div>

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
                        pathOptions={{ color: '#007bff', fillOpacity: 0.08 }}

                    />
                )}

                <Marker
                    position={[currentLocation.lat, currentLocation.lng]}
                    icon={userIcon}
                    draggable={true}
                    eventHandlers={{ dragend: handleMarkerDrag }}
                />

                    {visibleLugares.map((lugar, index) => {
                        // Resolve coordinates from multiple possible property names
                        const lat = lugar.lat ?? lugar.center?.lat ?? lugar.geometry?.coordinates?.[1] ?? lugar.latitude ?? lugar.y ?? lugar.center?.latitude;
                        const lng = lugar.lng ?? lugar.lon ?? lugar.center?.lon ?? lugar.geometry?.coordinates?.[0] ?? lugar.longitude ?? lugar.x ?? lugar.center?.longitude;

                        // If we can't resolve both lat and lng, skip rendering the marker
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
                            eventHandlers={{
                                click: () => {
                                    handlePlaceSelect(lugar);
                                }
                            }}
                        />
                    );
                })}
              </MapContainer>

                            {/* tu panel grande (EstablishmentInfo) continúa funcionando */}
                                {selectedPlace && (
                                        <EstablishmentInfo place={selectedPlace} onClose={handlePlaceClose} />
                                )}
                            </div>

                            <aside className="map-sidebar">
                                <div className="sidebar-inner">
                                    <h4 className="filters-title">{t('map.filters.title') || 'Filtros'}</h4>
                                    <button className={`filter-btn ${Object.values(filters).every(Boolean) ? 'active' : ''}`} onClick={toggleAllFilters} style={{ width: '100%', marginBottom: '8px' }}>
                                        {t('map.filters.all') || 'Todos'}
                                    </button>
                                    <div className="filters-vertical">
                                        <button type="button" className={`filter-btn ${filters.hospital ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, hospital: !f.hospital }))}>
                                            🏥 {t('map.filters.hospital')}
                                        </button>
                                        <button type="button" className={`filter-btn ${filters.clinic ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, clinic: !f.clinic }))}>
                                            🏩 {t('map.filters.clinic')}
                                        </button>
                                        <button type="button" className={`filter-btn ${filters.doctors ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, doctors: !f.doctors }))}>
                                            👨‍⚕️ {t('map.filters.doctors')}
                                        </button>
                                        <button type="button" className={`filter-btn ${filters.veterinary ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, veterinary: !f.veterinary }))}>
                                            🐾 {t('map.filters.veterinary')}
                                        </button>
                                    </div>
                                </div>
                            </aside>
                        </div>

            {/* Modales para ubicaciones guardadas */}
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
