import React, { useEffect, useMemo, useState } from 'react';
import './CostComparator.css';
import { fetchPricesForPlaces, getServiceTypes } from '../../services/pricesService';

export default function CostComparator({ places = [], onClose }) {
  const [selectedService, setSelectedService] = useState('consulta_general');
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState([]);

  const serviceTypes = getServiceTypes();

  // no preseleccionamos por defecto; el usuario elige qué comparar
  useEffect(() => {
    // limpiar selección si cambian los lugares
    setSelectedPlaces([]);
  }, [places]);

  const TYPE_OPTIONS = ['Hospital', 'Clínica', 'Veterinaria', 'Doctor'];

  const toggleType = (type) => {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const clearTypes = () => setSelectedTypes(new Set());

  const selectAllTypes = () => setSelectedTypes(new Set(TYPE_OPTIONS));

  const handleCompare = async () => {
    if (!selectedPlaces || selectedPlaces.length === 0) return;
    setLoading(true);
    try {
      const res = await fetchPricesForPlaces(selectedPlaces, selectedService);
      setPrices(res);
    } catch (error) {
      console.error('Error fetching prices', error);
    } finally {
      setLoading(false);
    }
  };

  const keyForPlace = (p) => (p.id || p.establecimientoId || p.name || p.nombre || JSON.stringify(p));

  const togglePlace = (p) => {
    const k = keyForPlace(p);
    setSelectedPlaces(prev => prev.includes(k) ? prev.filter(x=>x!==k) : [...prev, k]);
  };

  const selectAll = () => {
    // seleccionar solo los lugares que pasan el filtro de tipos
    const all = (filteredPlaces || []).map(p => keyForPlace(p));
    setSelectedPlaces(all);
  };

  const clearAll = () => setSelectedPlaces([]);

  const placesMap = useMemo(() => {
    const m = {};
    (places || []).forEach(p => {
      const id = keyForPlace(p);
      m[id] = p;
    });
    return m;
  }, [places]);

  const minPrice = useMemo(() => {
    if (!prices || prices.length === 0) return null;
    return Math.min(...prices.map(x => x.price));
  }, [prices]);

  // format number as currency (best effort)
  const fmt = (n) => {
    if (n == null) return '-';
  try { return Number(n).toLocaleString(undefined, { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }); } catch { return `$${n}`; }
  };

  const prettyType = (place) => {
    if (!place) return 'Servicio';
    const tags = place.tags || place.properties || {};
    const amenity = (tags.amenity || tags.healthcare || '')?.toString().toLowerCase();
    const name = (place.name || place.nombre || '')?.toString().toLowerCase();
    const tipo = (place.type || place.tipo || '')?.toString().toLowerCase();

    if (amenity.includes('hospital') || name.includes('hospital') || tipo.includes('hospital')) return 'Hospital';
    if (amenity.includes('clinic') || name.includes('clínica') || name.includes('clinic') || tipo.includes('clinic')) return 'Clínica';
    if (amenity.includes('veterinar') || name.includes('veterin') || tipo.includes('veterinary') || tipo.includes('veterin')) return 'Veterinaria';
    if (amenity.includes('doctor') || name.includes('doctor') || name.includes('médic') || tipo.includes('doctor')) return 'Doctor';

    return 'Servicio';
  };

  // Normalize a label to match our CSS badge class names
  const normalizeLabel = (s) => {
    if (!s) return '';
    // remove accents, toLowerCase, trim
    try {
      const from = s.toString();
      // normalize unicode and remove diacritics
      const normalized = from.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
      // map common variants to css keys
      if (normalized.includes('clinica') || normalized.includes('clínica') || normalized.includes('clinic')) return 'clinica';
      if (normalized.includes('hospital')) return 'hospital';
      if (normalized.includes('veterin') || normalized.includes('veterinaria')) return 'veterinaria';
      if (normalized.includes('doctor') || normalized.includes('médic') || normalized.includes('medic')) return 'doctor';
      return normalized.replace(/[^a-z0-9]/g, '');
    } catch {
      return String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
    }
  };

  const filteredPlaces = useMemo(() => {
    let items = places || [];
    if (selectedTypes && selectedTypes.size > 0) {
      items = items.filter(p => selectedTypes.has(prettyType(p)));
    }
    // ordenar alfabéticamente por nombre para mejor exploración
    return [...items].sort((a, b) => {
      const na = (a.name || a.nombre || '').toString().toLowerCase();
      const nb = (b.name || b.nombre || '').toString().toLowerCase();
      return na.localeCompare(nb);
    });
  }, [places, selectedTypes]);

  return (
  <div className="cost-compare-root" style={{position:'fixed', inset:0, width:'100vw', height:'100vh', padding:0, margin:0}}>
      <div className="cost-compare-panel">
        <button className="button button--icon modal-close" onClick={onClose} aria-label="Cerrar" title="Cerrar">
          <span className="close-x" aria-hidden="true">×</span>
        </button>
        <div className="cost-compare-header">
          <h3>Comparador de costos</h3>
        </div>

      <div className="cost-compare-controls">
        <select value={selectedService} onChange={(e)=>setSelectedService(e.target.value)} className="cc-select">
          {Object.keys(serviceTypes).map(k => (
            <option key={k} value={k}>{serviceTypes[k]}</option>
          ))}
        </select>

        <button type="button" className="btn-compare" onClick={handleCompare} disabled={loading || selectedPlaces.length===0}>{loading ? 'Comparando...' : 'Comparar'}</button>
      </div>

      <div style={{marginTop:12}}>
        <div className="cc-select-row" style={{marginBottom:8}}>
          <strong className="cc-title">Seleccionar establecimientos:</strong>
          <button type="button" onClick={selectAll} className="btn-ghost">Seleccionar todo</button>
          <button type="button" onClick={clearAll} className="btn-ghost">Limpiar</button>
          <span className="cc-selected-count">{selectedPlaces.length} seleccionados</span>
          {/* filtros movidos abajo para mejor visualización */}
        </div>

        <div className="cc-places-list">
          {(filteredPlaces || []).map(p => {
            const k = keyForPlace(p);
            const name = p.name || p.nombre || p.tags?.name || p.properties?.name || k;
            const addr = p.address || p.direccion || p.tags?.addr_full || p.tags?.address || p.properties?.address || '';
            return (
              <label key={k} className="cc-place-item" onClick={(evt)=>evt.stopPropagation()}>
                <input type="checkbox" checked={selectedPlaces.includes(k)} onChange={() => togglePlace(p)} onClick={(evt)=>evt.stopPropagation()} />
                <div className="cc-place-name">{name}</div>
                <div className="cc-place-addr">{addr}</div>
              </label>
            );
          })}
        </div>

  <div className="cc-specialty-filters" onClick={(evt)=>evt.stopPropagation()}>
          <div className="cc-filter-title">Filtrar por tipo:</div>
          <div className="cc-specialty-list">
            {TYPE_OPTIONS.map(t => (
              <label key={t} className="cc-specialty-label">
                <input type="checkbox" checked={selectedTypes.has(t)} onChange={()=>toggleType(t)} onClick={(evt)=>evt.stopPropagation()} />
                <span className="cc-specialty-text">{t}</span>
              </label>
            ))}
          </div>
          <div className="cc-specialty-actions">
            <button type="button" className="btn-ghost" onClick={selectAllTypes}>Todos</button>
            <button type="button" className="btn-ghost" onClick={clearTypes}>Limpiar</button>
          </div>
        </div>
      </div>

      <div style={{marginTop:12, display:'flex', flexDirection:'column', flex:1}}>
        {prices.length === 0 ? (
          <div className="cost-empty">Presiona "Comparar" para generar resultados (usa datos mock por ahora).</div>
        ) : (
          <div className="cost-table-wrapper">
            <table className="cost-table">
              <thead>
                <tr>
                  <th style={{width:'44%'}}>Establecimiento / Sucursal</th>
                  <th style={{width:'16%'}}>Tipo</th>
                  <th style={{width:'24%'}}>Servicio</th>
                  <th style={{width:'16%'}}>Precio</th>
                </tr>
              </thead>
              <tbody>
                {prices.slice().sort((a,b)=> (a.price||0)-(b.price||0)).map(p => {
                  const place = placesMap[p.placeId] || null;
                  const address = (place && (place.address || place.direccion || place.tags?.addr_full || place.tags?.address || place.properties?.address)) || 'Sucursal principal';
                  const tipoLabel = prettyType(place || {});
                  const isCheapest = (p.price != null && minPrice != null && p.price === minPrice);
                  return (
                    <tr key={p.placeId} className={isCheapest ? 'cheapest' : ''}>
                      <td>
                        <div className="cc-result-name">{(place && (place.name || place.nombre)) || p.name || p.placeId}</div>
                        <div className="cc-result-sub">{address}</div>
                      </td>
                      <td className="cc-result-type"><span className={`badge badge--${normalizeLabel(tipoLabel)}`}>{tipoLabel}</span></td>
                      <td className="cc-result-service">{serviceTypes[p.service]}</td>
                      <td className={p.price === minPrice ? 'cost-highlight' : ''}>
                        {fmt(p.price)} {isCheapest && <span className="cheapest-indicator" aria-hidden>★</span>} 
                        {isCheapest && <div className="cheapest-label">Mejor precio</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
