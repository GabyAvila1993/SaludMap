import React from 'react';
import opening_hours from "opening_hours";
import './EstablishmentInfo.css';

export default function EstablishmentInfo({ place, onClose }) {
  if (!place) return null;

  const nombre = place.tags?.name ?? place.properties?.name ?? place.tags?.amenity ?? 'Servicio de salud';
  const coords = [
    place.lat ?? place.center?.lat ?? place.geometry?.coordinates?.[1],
    place.lng ?? place.center?.lon ?? place.geometry?.coordinates?.[0],
  ];

  const props = place.properties ?? {};

  const buildAddress = () => {
    const t = place.tags ?? props ?? {};
    const fullCandidates = [t.addr_full, t['addr:full'], t.address, props.address];
    for (const c of fullCandidates) if (c) return String(c);

    const street = t['addr:street'] ?? t.street ?? t['street:name'];
    const number = t['addr:housenumber'] ?? t.housenumber ?? t['street:number'];
    const city = t['addr:city'] ?? t.city ?? props.city ?? t.town ?? t.village;
    const parts = [];
    if (street) parts.push(street);
    if (number) parts.push(number);
    if (city && !parts.includes(city)) parts.push(city);
    if (parts.length) return parts.join(' ');

    const fallback = t['addr:suburb'] ?? t.suburb ?? t.neighbourhood ?? t['addr:postcode'] ?? t.postcode;
    if (fallback) return String(fallback);

    if (coords[0] && coords[1]) return `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`;

    return '—';
  };

  const direccion = buildAddress();
  const initial = nombre ? nombre.trim().charAt(0).toUpperCase() : 'E';

  const collectValues = (obj, keys) => {
    const vals = [];
    for (const k of keys) {
      const raw = obj?.[k];
      if (!raw) continue;
      if (Array.isArray(raw)) vals.push(...raw.map(String));
      else if (typeof raw === 'object') {
        for (const v of Object.values(raw)) if (v) vals.push(String(v));
      } else vals.push(String(raw));
    }
    return [...new Set(vals)];
  };

  const tags = place.tags ?? place.properties ?? {};

  const phones = collectValues(tags, ['phone', 'telephone', 'contact:phone', 'contact_phone', 'tel', 'contact']);
  const emails = collectValues(tags, ['email', 'contact:email', 'contact_email']);
  const websites = collectValues(tags, ['website', 'url', 'contact:website']);
  const socials = collectValues(tags, ['facebook', 'twitter', 'instagram', 'contact:facebook', 'contact:twitter', 'contact:instagram']);
  const opening = tags.opening_hours ?? tags['opening_hours:covid'] ?? '';
  const owner = tags.operator ?? tags.owner ?? tags['contact:owner'] ?? '';
  const extraNotes = tags.notes ?? tags.description ?? place.properties?.description ?? '';

  const AMENITY_ES = {
    hospital: 'Hospital',
    clinic: 'Clínica',
    pharmacy: 'Farmacia',
    doctors: 'Médico',
    doctor: 'Médico',
    dentist: 'Dentista',
    veterinary: 'Veterinaria',
    social_facility: 'Centro social',
    nursing_home: 'Residencia',
    optician: 'Óptico',
    blood_donation: 'Donación de sangre',
    health_post: 'Puesto de salud',
    rehabilitation: 'Rehabilitación',
    ambulance: 'Ambulancia',
  };

  const getFriendlyType = () => {
    const rawType = tags.amenity ?? tags.healthcare ?? tags.shop ?? place.type ?? '';
    if (!rawType) return '';
    const key = String(rawType).toLowerCase();
    if (AMENITY_ES[key]) return AMENITY_ES[key];
    return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const friendlyType = getFriendlyType();

  const formatOpeningHours = (opening) => {
    if (!opening) return [];
    try {
      const oh = new opening_hours(opening, {}, { locale: "es" });
      const dias = ["lunes","martes","miércoles","jueves","viernes","sábado","domingo"];
      return dias.map((dia, i) => {
        const today = new Date(2023, 0, 2 + i);
        const tomorrow = new Date(2023, 0, 3 + i);
        const intervals = oh.getOpenIntervals(today, tomorrow);
        if (intervals.length === 0) return `${dia}: Cerrado`;

        const formatted = intervals.map(iv =>
          `${iv[0].toTimeString().slice(0,5)}–${iv[1].toTimeString().slice(0,5)}`
        ).join(", ");

        return `${dia}: ${formatted}`;
      });
    } catch {
      return [opening];
    }
  };

  const openingFormatted = formatOpeningHours(opening);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.warn('No se pudo copiar al portapapeles', e);
    }
  };

  const osmLink = (lat, lon) => `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`;

  return (
    <div className="establishment-info">
      <div className="establishment-card">
        <div className="card-header">
          <div className="card-title">{nombre}</div>
          <div className="card-type">{friendlyType || (place.type ?? '')}</div>
          <button className="card-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <div className="card-body">
          <div className="card-left">
            <div className="avatar">{initial}</div>
            <div className="avatar-label">Establecimiento</div>
          </div>

          <div className="card-right">
            <div className="info-row">
              <div className="info-label">DIRECCIÓN</div>
              <div className="info-value">{direccion || '—'}</div>
            </div>

            {phones.map((p, i) => (
              <div className="info-row" key={`phone-${i}`}>
                <div className="info-label">TELÉFONO</div>
                <div className="info-value"><a href={`tel:${p}`}>{p}</a></div>
              </div>
            ))}

            {emails.map((e, i) => (
              <div className="info-row" key={`email-${i}`}>
                <div className="info-label">EMAIL</div>
                <div className="info-value"><a href={`mailto:${e}`}>{e}</a></div>
              </div>
            ))}

            {websites.map((w, i) => (
              <div className="info-row" key={`web-${i}`}>
                <div className="info-label">WEB</div>
                <div className="info-value"><a href={w} target="_blank" rel="noreferrer">{w}</a></div>
              </div>
            ))}

            {socials.map((s, i) => (
              <div className="info-row" key={`soc-${i}`}>
                <div className="info-label">RED</div>
                <div className="info-value"><a href={s} target="_blank" rel="noreferrer">{s}</a></div>
              </div>
            ))}

            {opening && (
              <div className="info-row">
                <div className="info-label">HORARIO</div>
                <div className="info-value">
                  {openingFormatted.map((line, i) => <div key={i}>{line}</div>)}
                </div>
              </div>
            )}

            {owner && (
              <div className="info-row">
                <div className="info-label">OPERADOR</div>
                <div className="info-value">{owner}</div>
              </div>
            )}

            {extraNotes && (
              <div className="info-row">
                <div className="info-label">NOTAS</div>
                <div className="info-value">{extraNotes}</div>
              </div>
            )}

            <div className="info-row">
              <div className="info-label">COORDENADAS</div>
              <div className="info-value">
                {coords[0]?.toFixed(6) ?? '—'}, {coords[1]?.toFixed(6) ?? '—'}
                <div className="extra-actions">
                  <button onClick={() => copyToClipboard(`${coords[0]},${coords[1]}`)}>Copiar</button>
                  <a target="_blank" rel="noreferrer" href={osmLink(coords[0], coords[1])}>Abrir en OSM</a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
