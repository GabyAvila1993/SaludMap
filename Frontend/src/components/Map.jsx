import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix ícono por defecto en Vite / React
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function MapComponent() {
  const [pos, setPos] = useState(null); // posición en tiempo real del gps
  const [calPos, setCalPos] = useState(null); // posición calibrada por muestreo
  const [manualPos, setManualPos] = useState(null); // si el usuario arrastra el marcador
  const [accuracy, setAccuracy] = useState(null);
  const [lugares, setLugares] = useState([]);
  const [error, setError] = useState('');
  const [sampling, setSampling] = useState(false);
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  const samplesRef = useRef([]);
  const watchIdRef = useRef(null);

  // Icono explícito para usuario (círculo azul)
  const userIcon = L.divIcon({
    html: `<div class="user-icon"></div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });

  // broadcast de posición para otros componentes
  const broadcastPos = (p, source = 'gps') => {
    try {
      // log temporal para depuración
      console.log('[Map] broadcastPos ->', { lat: p.lat, lng: p.lng, source });
      window.dispatchEvent(new CustomEvent('saludmap:pos-changed', { detail: { lat: p.lat, lng: p.lng, source } }));
    } catch (e) {
      console.error('[Map] broadcastPos error', e);
    }
  };

  // Iconos por tipo (divIcons)
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
  const getIconForType = (t) => {
    const def = iconDefs[t] ?? iconDefs.default;
    const key = `${def.color}-${def.label}`;
    if (!iconCache[key]) iconCache[key] = createDivIcon(def.color, def.label);
    return iconCache[key];
  };

  // Geolocalización con watchPosition (alta precisión)
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada por el navegador.');
      return;
    }

    const success = (p) => {
      const coords = { lat: p.coords.latitude, lng: p.coords.longitude };
      setPos(coords);
      setAccuracy(p.coords.accuracy);
      if (mapRef.current && !manualPos && !calPos) mapRef.current.setView([coords.lat, coords.lng], 15);
      // notificar cambio de posicion GPS
      broadcastPos(coords, 'gps');
    };

    const fail = (e) => {
      console.warn('geo err', e);
      setError('No se pudo obtener ubicación exacta. Usa "Calibrar posición" o arrastra el marcador.');
    };

    const id = navigator.geolocation.watchPosition(success, fail, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0,
    });
    watchIdRef.current = id;

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch places usando la posición efectiva (manual > calibrada > realtime)
  useEffect(() => {
    const effective = manualPos ?? calPos ?? pos;
    if (!effective) return;

    const fetchPlaces = async () => {
      try {
        const types = ['hospital', 'clinic', 'doctors', 'veterinary'].join(',');
        const res = await axios.get(`/places?lat=${effective.lat}&lng=${effective.lng}&types=${types}`);
        const data = res.data;
        let resultados = [];
        if (Array.isArray(data)) resultados = data;
        else if (Array.isArray(data.lugares)) resultados = data.lugares;
        else if (Array.isArray(data.elements)) resultados = data.elements;
        else if (Array.isArray(data.features)) resultados = data.features;
        else resultados = data.elements ?? data.lugares ?? [];
        setLugares(resultados);
      } catch (e) {
        console.error('Error al obtener places:', e);
        setError('Error al conectar con el backend (/places).');
      }
    };

    fetchPlaces();
  }, [pos, calPos, manualPos]);

  // Calibrar: tomar N muestras por watch temporal o por getCurrentPosition repetido
  const calibrarPosicion = async (durationMs = 6000, maxSamples = 12) => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada.');
      return;
    }
    if (sampling) return;
    setSampling(true);
    samplesRef.current = [];
    setError('');
    const tempId = navigator.geolocation.watchPosition(
      (p) => {
        samplesRef.current.push({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy, t: Date.now() });
        if (samplesRef.current.length >= maxSamples) {
          finishSampling(tempId);
        }
      },
      (e) => {
        console.warn('calib err', e);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );

    setTimeout(() => {
      finishSampling(tempId);
    }, durationMs);
  };

  const finishSampling = (tempId) => {
    if (tempId != null) navigator.geolocation.clearWatch(tempId);
    const samples = samplesRef.current.slice();
    if (!samples.length) {
      setError('No se recogieron muestras. Reintenta al aire libre con GPS activo.');
      setSampling(false);
      return;
    }
    const lats = samples.map((s) => s.lat).sort((a, b) => a - b);
    const lngs = samples.map((s) => s.lng).sort((a, b) => a - b);
    const accs = samples.map((s) => s.acc).sort((a, b) => a - b);
    const median = (arr) => arr[Math.floor(arr.length / 2)];
    const latMed = median(lats);
    const lngMed = median(lngs);
    const accMed = median(accs);
    const calibrated = { lat: latMed, lng: lngMed };
    setCalPos(calibrated);
    setAccuracy(accMed);
    if (mapRef.current) mapRef.current.setView([calibrated.lat, calibrated.lng], 17);
    // notificar posicion calibrada
    broadcastPos(calibrated, 'calibrated');
    setSampling(false);
  };

  const handleMapCreated = (mapInstance) => {
    mapRef.current = mapInstance;
    setMapReady(true);
  };

  const onRecenter = () => {
    const effective = manualPos ?? calPos ?? pos;
    if (!effective || !mapRef.current) return;
    try {
      if (typeof mapRef.current.invalidateSize === 'function') mapRef.current.invalidateSize();
      if (typeof mapRef.current.flyTo === 'function') mapRef.current.flyTo([effective.lat, effective.lng], 15, { duration: 0.7 });
      else mapRef.current.setView([effective.lat, effective.lng], 15);
    } catch (err) {
      console.error('[Map] error al recentrar', err);
    }
  };

  const getCoords = (item) => {
    const lat = item.lat ?? item.center?.lat ?? item.geometry?.coordinates?.[1];
    const lng = item.lon ?? item.center?.lon ?? item.geometry?.coordinates?.[0];
    if (lat == null || lng == null) return null;
    return [lat, lng];
  };

  const getTypeFromPlace = (place) => {
    const tags = place.tags ?? place.properties ?? {};
    const amenity = (tags.amenity || tags.healthcare || '').toString().toLowerCase();
    if (amenity.includes('hospital')) return 'hospital';
    if (amenity.includes('clinic')) return 'clinic';
    if (amenity.includes('veterinary')) return 'veterinary';
    if (amenity.includes('doctor') || amenity.includes('doctors') || tags.doctors) return 'doctors';
    const name = (tags.name || '').toString().toLowerCase();
    if (name.includes('hospital')) return 'hospital';
    if (name.includes('clínica') || name.includes('clinica') || name.includes('clinic')) return 'clinic';
    if (name.includes('veterin') || name.includes('vet')) return 'veterinary';
    if (name.includes('dr ') || name.includes('doctor') || name.includes('médic') || name.includes('medic')) return 'doctors';
    return 'default';
  };

  // ubicación a mostrar y su precisión
  const displayPos = manualPos ?? calPos ?? pos;
  const displayAcc = accuracy;

  return (
    <div className="map-root">
      <h3 className="map-title">Mapa de servicios cercanos</h3>

      {error && <div className="map-error">{error}</div>}

      <div className="map-info-row">
        <div className="map-precision">
          <span>Precisión: {displayAcc ? `${Math.round(displayAcc)} m` : '—'}</span>
          <span className="map-state">{manualPos ? ' (ajuste manual)' : calPos ? ' (calibrada)' : ''}</span>
        </div>
      </div>

      {!displayPos ? (
        <p>Obteniendo ubicación...</p>
      ) : (
        <div className="map-wrapper">
          <MapContainer whenCreated={handleMapCreated} center={[displayPos.lat, displayPos.lng]} zoom={15} className="leaflet-map">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {displayAcc != null && <Circle center={[displayPos.lat, displayPos.lng]} radius={displayAcc} pathOptions={{ color: '#007bff', fillOpacity: 0.08 }} />}
            <Marker
              position={[displayPos.lat, displayPos.lng]}
              icon={userIcon}
              draggable={true}
              zIndexOffset={1000}
              eventHandlers={{
                click: (e) => {
                  const latlng = e.latlng;
                  if (latlng) {
                    const mpos = { lat: latlng.lat, lng: latlng.lng };
                    setManualPos(mpos);
                    setAccuracy(null);
                    broadcastPos(mpos, 'manual');
                  }
                },
                dragend: (e) => {
                  const m = e.target;
                  const latlng = m.getLatLng();
                  setManualPos({ lat: latlng.lat, lng: latlng.lng });
                  setAccuracy(null);
                },
              }}
            >
              <Popup>
                <div className="popup-content">
                  Tu ubicación {manualPos ? '(ajustada manualmente)' : calPos ? '(calibrada)' : '(GPS)'}
                  <div className="popup-actions">
                    <button
                      onClick={() => {
                        setManualPos(null);
                        if (calPos && mapRef.current) mapRef.current.setView([calPos.lat, calPos.lng], 16);
                      }}
                      className="popup-btn"
                    >
                      Quitar ajuste manual
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>

            {lugares.map((lugar, i) => {
              const coords = getCoords(lugar);
              if (!coords) return null;
              const nombre = lugar.tags?.name ?? lugar.properties?.name ?? lugar.tags?.amenity ?? 'Servicio';
              const detalle = lugar.tags?.addr_full ?? lugar.tags?.address ?? lugar.properties?.address ?? '';
              const tipo = getTypeFromPlace(lugar);
              const icon = getIconForType(tipo);
              return (
                <Marker key={i} position={coords} icon={icon}>
                  <Popup>
                    <div className="popup-content">
                      <strong>{nombre}</strong>
                      {detalle && <div className="popup-detail">{detalle}</div>}
                      <div className="popup-detail-type">Tipo detectado: {tipo}</div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      )}
    </div>
  );
}