// INICIO CAMBIO - Archivo: src/components/Map.jsx - Integración con servicios
<<<<<<< HEAD
import React, { useState, useRef, useEffect } from 'react'
import { MapContainer, Marker, Circle, useMap } from 'react-leaflet';
=======
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, Marker, Popup, Circle, useMap } from 'react-leaflet';
>>>>>>> a6b91c6342463559b7e40fc06740075a453e6fd5
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
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [showSaveLocationModal, setShowSaveLocationModal] = useState(false);
    const [showSavedLocationsList, setShowSavedLocationsList] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);

    const mapRef = useRef(null);
    const unsubscribeRef = useRef(null);

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
                mapRef.current.setView([event.detail.lat, event.detail.lng], 15, {
                    animate: true,
                    duration: 0.5
                });
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
            mapRef.current.setView([location.lat, location.lng], 15, {
                animate: true,
                duration: 0.5
            });
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
                    const types = ['hospital', 'clinic', 'doctors', 'veterinary'].join(',');
                    const response = await axios.get(
                        `/places?lat=${location.lat}&lng=${location.lng}&types=${types}`
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
                mapRef.current.setView([location.lat, location.lng], 15, {
                    animate: true,
                    duration: 0.5
                });
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
                mapRef.current.setView([location.lat, location.lng], 15, {
                    animate: true,
                    duration: 0.5
                });
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

            <div className="map-wrapper">
<<<<<<< HEAD
              <MapContainer
                center={[currentLocation.lat, currentLocation.lng]}
                zoom={15}
                className="leaflet-map"
                whenCreated={(mapInstance) => { mapRef.current = mapInstance }}
                onClick={() => setSelectedPlace(null)}
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
=======
                <MapContainer
                    center={[currentLocation.lat, currentLocation.lng]}
                    className="leaflet-map"
                >
                    <MapController />
                    <OfflineTileLayer 
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
>>>>>>> a6b91c6342463559b7e40fc06740075a453e6fd5
                    />
                )}

                <Marker
                    position={[currentLocation.lat, currentLocation.lng]}
                    icon={userIcon}
                    draggable={true}
                    eventHandlers={{ dragend: handleMarkerDrag }}
                />

                    {lugares.map((lugar, index) => {
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
                                    setSelectedPlace(lugar);
                                }
                            }}
                        />
                    );
                })}
              </MapContainer>

              {/* tu panel grande (EstablishmentInfo) continúa funcionando */}
                            {selectedPlace && (
                                <EstablishmentInfo place={selectedPlace} onClose={() => setSelectedPlace(null)} />
                            )}
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
    );
}
// FIN CAMBIO - Archivo: src/components/Map.jsx