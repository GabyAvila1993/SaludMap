import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './Turnos.css';

export default function Turnos() {
  const [pos, setPos] = useState(null);
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [datetime, setDatetime] = useState('');
  const [notes, setNotes] = useState('');
  const [misTurnos, setMisTurnos] = useState([]);
  const [cancellingId, setCancellingId] = useState(null);
  const [selectedType, setSelectedType] = useState('default');
  const fetchTimeoutRef = useRef(null);
  const watchIdRef = useRef(null);
  const prevPosRef = useRef(null);

  // obtener posición aproximada (si existe)
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((p) => {
      setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
    }, () => { }, { enableHighAccuracy: false });
  }, []);

  // helper: distancia en metros entre dos coords
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

  // cargar profesionales cercanos
  useEffect(() => {
    if (!pos) return;
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('[Turnos] pos changed ->', pos, 'prevPos ->', prevPosRef.current);
        const minDist = 20; // metros mínimos para refetch (bajado de 100 a 20)
        const dist = distanceMeters(prevPosRef.current, pos);
        if (prevPosRef.current && dist < minDist) {
          console.log(`[Turnos] movimiento ${Math.round(dist)}m < ${minDist}m — salto fetch`);
          return;
        }

        setLoading(true);
        const types = ['hospital', 'clinic', 'doctors', 'veterinary'].join(',');
        const url = `/places?lat=${pos.lat}&lng=${pos.lng}&types=${types}&radius=3000`;
        console.log('[Turnos] fetching places ->', url);
        const res = await axios.get(url);
        const data = res.data;
        const resultados = Array.isArray(data) ? data : (data.lugares ?? data.elements ?? data.features ?? []);
        console.log('[Turnos] places respuesta, count =', resultados.length);
        setLugares(resultados);
        setError('');
        prevPosRef.current = pos; // actualizar referencia luego de fetch exitoso
      } catch (e) {
        console.warn('Error cargando profesionales', e);
        setError('No se pudieron cargar profesionales.');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current); };
  }, [pos]);

  // detectar tipo a partir del objeto place (misma heurística que en Map.jsx)
  const getTypeFromPlace = (place) => {
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

  const prettyType = (t) => {
    if (!t) return 'Servicio';
    return { hospital: 'Hospital', clinic: 'Clínica', doctors: 'Doctor', veterinary: 'Veterinaria', default: 'Servicio' }[t] ?? t;
  };

  // abrir modal para un profesional
  const openModal = (prof) => {
    setSelected(prof);
    setDatetime('');
    setNotes('');
    setSelectedType(getTypeFromPlace(prof));
    setModalOpen(true);
  };

  // enviar solicitud de turno
  const solicitarTurno = async () => {
    if (!selected || !datetime) {
      setError('Elige fecha y hora.');
      return;
    }
    try {
      const payload = {
        professionalId: selected.id ?? (selected.osm_id ?? null),
        professionalName: selected.tags?.name ?? selected.properties?.name ?? 'Profesional',
        datetime,
        notes,
        user: 'usuario', // cambiar por auth real
        professionalType: selectedType ?? getTypeFromPlace(selected),
      };
      await axios.post('/turnos', payload);
      setModalOpen(false);
      await cargarMisTurnos(); // refrescar lista
      alert('Turno solicitado correctamente.');
    } catch (e) {
      console.error(e);
      setError('Error al solicitar turno.');
    }
  };

  const cargarMisTurnos = async () => {
    try {
      const res = await axios.get(`/turnos?user=usuario`);
      const data = res.data;
      // Normalizar: si el backend devuelve { turnos: [...] } o un array directo
      const arr = Array.isArray(data) ? data : (Array.isArray(data?.turnos) ? data.turnos : []);
      setMisTurnos(arr);
    } catch (e) {
      console.warn('Error cargando mis turnos', e);
      setMisTurnos([]);
    }
  };
  useEffect(() => { cargarMisTurnos(); }, []);

  const cancelarTurno = async (id) => {
    console.log('[Turnos] cancelarTurno called, id=', id);
    if (!id) {
      alert('No se pudo cancelar: id de turno inexistente');
      return;
    }
    try {
      setCancellingId(id);
      const url = `/turnos/${encodeURIComponent(id)}`;
      console.log('[Turnos] PUT', url);
      const res = await axios.put(url, { action: 'cancel' });
      console.log('[Turnos] respuesta cancel:', res);
      if (res?.data?.id) {
        // eliminar inmediatamente el turno cancelado de la lista local
        setMisTurnos((prev) => prev.filter((t) => t.id !== res.data.id));
      }
      // opcional: refrescar desde backend para sincronizar estado
      await cargarMisTurnos();
    } catch (err) {
      console.error('[Turnos] error cancelando turno', err);
      alert('Error cancelando turno: ' + (err?.response?.data?.message ?? err.message));
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      console.log('[Turnos] recibí saludmap:pos-changed ->', e?.detail);
      const d = e.detail;
      if (d?.lat && d?.lng) {
        // si la actualización viene por interacción manual/calibrado/reset forzamos refetch
        if (d.source === 'manual' || d.source === 'calibrated' || d.source === 'reset') {
          prevPosRef.current = null; // fuerza que el siguiente fetch se ejecute
        }
        setPos({ lat: d.lat, lng: d.lng });
      }
    };
    window.addEventListener('saludmap:pos-changed', handler);
    return () => {
      window.removeEventListener('saludmap:pos-changed', handler);
    };
  }, []);

  return (
    <div className="turnos-root">
      <div className="turnos-header">
        <div className="turnos-badge" style={{ background: '#47472eff' }}>Turnos</div>
        <h3>Solicitar Turnos</h3>
      </div>

      <div className="turnos-body">
        <div className="turnos-left">
          <h4>Profesionales cercanos</h4>
          {loading && <div>Cargando...</div>}
          {error && <div className="turnos-error">{error}</div>}
          {!loading && lugares.length === 0 && <div>No se encontraron profesionales.</div>}
          <ul className="prof-list">
            {lugares.map((p, i) => {
              const name = p.tags?.name ?? p.properties?.name ?? 'Sin nombre';
              const addr = p.tags?.addr_full ?? p.tags?.address ?? '';
              const tipo = getTypeFromPlace(p);
              return (
                <li key={i} className="prof-item">
                  <div className="prof-info">
                    <div className="prof-name">{name}</div>
                    {addr && <div className="prof-addr">{addr}</div>}
                    <div className="prof-type">{prettyType(tipo)}</div>
                  </div>
                  <div>
                    <button className="btn-primary" onClick={() => openModal(p)}>Solicitar Turnos</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="turnos-right">
          <h4>Mis turnos</h4>
          {!Array.isArray(misTurnos) || misTurnos.length === 0 ? (
            <div>No tenés turnos registrados.</div>
          ) : (
            <ul className="my-turns">
              {misTurnos.map((t) => (
                <li key={t.id} className="turn-item">
                  <div>
                    <strong>{t.professionalName}</strong>
                    <div style={{ fontSize: 12, color: '#666' }}>{prettyType(t.professionalType)}</div>
                  </div>
                  <div>{new Date(t.datetime).toLocaleString()}</div>
                  <div className="turn-actions">
                    <button className="btn-ghost" onClick={() => cancelarTurno(t.id)}>Cancelar</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {modalOpen && selected && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal__header">
              <span className="modal__title">Solicitar turno</span>
              <button
                className="button button--icon modal-close"
                onClick={() => setModalOpen(false)}
                aria-label="Cerrar"
                title="Cerrar"
              >
                <span className="close-x" aria-hidden="true">×</span>
              </button>
            </div>

            <div className="modal__body">
              <div className="input">
                <label className="input__label">Profesional</label>
                <div className="input__field">{selected.tags?.name ?? selected.properties?.name ?? 'Profesional'}</div>
                <p className="input__description">{selected.tags?.addr_full ?? selected.tags?.address ?? ''}</p>
              </div>

              <div className="input">
                <label className="input__label">Tipo</label>
                <div className="input__field">{prettyType(selectedType)}</div>
              </div>

              <div className="input">
                <label className="input__label">Fecha y hora</label>
                <div className="input-with-icon">
                  <input
                    id="turnos-datetime"
                    className="input__field"
                    type="datetime-local"
                    value={datetime}
                    onChange={(e) => setDatetime(e.target.value)}
                  />
                  <button
                    type="button"
                    className="calendar-btn"
                    onClick={() => {
                      const el = document.getElementById('turnos-datetime');
                      /* showPicker() si está soportado, sino focus */
                      if (el && typeof el.showPicker === 'function') {
                        el.showPicker();
                      } else {
                        el?.focus();
                      }
                    }}
                    aria-label="Abrir selector de fecha"
                    title="Abrir selector de fecha"
                  >
                    {/* icono calendar inline */}
                    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path fill="none" d="M0 0h24v24H0z"/>
                      <path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H5V9h14zM7 11h5v5H7z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="input">
                <label className="input__label">Observaciones (opcional)</label>
                <textarea className="input__field input__field--textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>

            <div className="modal__footer">
              <button className="button button--primary" onClick={solicitarTurno}>Confirmar turno</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}