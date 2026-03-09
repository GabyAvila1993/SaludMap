// Archivo: src/components/TurnoModal2.jsx
import React, { useEffect, useState, useMemo, useRef } from 'react';
import './TurnoModal2.css';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getEspecialidadesByEstablecimiento } from '../../services/especialidadesService.js';
// ─────────────────────────────────────────────────────────────────────────────
// PARSER DE HORARIOS
// ─────────────────────────────────────────────────────────────────────────────
const DIAS_MAP = {
    domingo: 0, domingos: 0,
    lunes: 1,
    martes: 2,
    miercoles: 3, miércoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6, sábado: 6, sabados: 6, sábados: 6,
};
const NOMBRES_DIA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const NOMBRES_MES = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];
const norm = (s) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
const tokenADia = (token) => {
    const n = norm(token);
    if (DIAS_MAP[n] !== undefined) return DIAS_MAP[n];
    for (const [nombre, num] of Object.entries(DIAS_MAP)) {
        if (n.startsWith(norm(nombre)) || norm(nombre).startsWith(n)) return num;
    }
    return undefined;
};
const parsearHorarios = (horariosStr) => {
    if (!horariosStr || !horariosStr.trim()) {
        return { diasPermitidos: new Set(), franjas: [] };
    }
    const diasPermitidos = new Set();
    const franjas = [];
    const bloques = horariosStr.split(/[|\/]/).map(b => b.trim()).filter(Boolean);
    for (const bloque of bloques) {
        const horas = [...bloque.matchAll(/\d{1,2}:\d{2}/g)].map(m => m[0].padStart(5, '0'));
        if (horas.length < 2) continue;
        const desde = horas[0];
        const hasta = horas[1];
        const idxPrimeraHora = bloque.search(/\d{1,2}:\d{2}/);
        const textoDias = norm(bloque.substring(0, idxPrimeraHora))
            .replace(/:\s*$/, '')
            .replace(/\bde\b$/, '')
            .trim();
        const diasBloque = new Set();
        const rangoRe = /(\w+)\s+a\s+(\w+)/g;
        let rm;
        while ((rm = rangoRe.exec(textoDias)) !== null) {
            if (/\d/.test(rm[1]) || /\d/.test(rm[2])) continue;
            const ini = tokenADia(rm[1]);
            const fin = tokenADia(rm[2]);
            if (ini !== undefined && fin !== undefined) {
                const start = Math.min(ini, fin);
                const end   = Math.max(ini, fin);
                for (let d = start; d <= end; d++) {
                    diasBloque.add(d);
                    diasPermitidos.add(d);
                }
            }
        }
        const tokens = textoDias
            .replace(/\sy\s/g, ' ')
            .split(/[\s,]+/)
            .filter(t => t.length > 2 && !/^(de|al|el|la|los|las|a)$/.test(t));
        for (const token of tokens) {
            const num = tokenADia(token);
            if (num !== undefined) {
                diasBloque.add(num);
                diasPermitidos.add(num);
            }
        }
        if (diasBloque.size > 0) {
            franjas.push({ dias: diasBloque, desde, hasta });
        }
    }
    return { diasPermitidos, franjas };
};
// ─── Slots de 15 minutos ─────────────────────────────────────────────────────
const generarSlots = (franjas, fecha) => {
    if (!fecha || !franjas.length) return [];
    const diaSemana = fecha.getDay();
    const slots = [];
    for (const franja of franjas) {
        if (!franja.dias.has(diaSemana)) continue;
        const [hI, mI] = franja.desde.split(':').map(Number);
        const [hF, mF] = franja.hasta.split(':').map(Number);
        let min = hI * 60 + mI;
        const finMin = hF * 60 + mF;
        while (min < finMin) {
            slots.push(
                `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
            );
            min += 15;
        }
    }
    return slots;
};
// ─── Componente Calendario Visual ────────────────────────────────────────────
function CalendarioVisual({ diasPermitidos, fechaSeleccionada, onSeleccionarFecha }) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const [anio, setAnio] = useState(hoy.getFullYear());
    const [mes, setMes]   = useState(hoy.getMonth());
    const irAnterior  = () => mes === 0  ? (setMes(11), setAnio(a => a - 1)) : setMes(m => m - 1);
    const irSiguiente = () => mes === 11 ? (setMes(0),  setAnio(a => a + 1)) : setMes(m => m + 1);
    const primerDia = new Date(anio, mes, 1).getDay();
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();
    const celdas = [];
    for (let i = 0; i < primerDia; i++) celdas.push(null);
    for (let d = 1; d <= diasEnMes; d++) celdas.push(new Date(anio, mes, d));
    const esMismoDia = (a, b) =>
        a && b &&
        a.getFullYear() === b.getFullYear() &&
        a.getMonth()    === b.getMonth()    &&
        a.getDate()     === b.getDate();
    return (
        <div className="calendario">
            <div className="calendario__nav">
                <button type="button" className="calendario__nav-btn" onClick={irAnterior}>‹</button>
                <span className="calendario__mes-anio">{NOMBRES_MES[mes]} {anio}</span>
                <button type="button" className="calendario__nav-btn" onClick={irSiguiente}>›</button>
            </div>
            <div className="calendario__grilla">
                {NOMBRES_DIA.map(d => (
                    <div key={d} className="calendario__cabecera">{d}</div>
                ))}
                {celdas.map((fecha, i) => {
                    if (!fecha) return (
                        <div key={`v-${i}`} className="calendario__celda calendario__celda--vacia" />
                    );
                    const esPasado       = fecha < hoy;
                    const esDisponible   = !esPasado && diasPermitidos.has(fecha.getDay());
                    const esSeleccionado = esMismoDia(fecha, fechaSeleccionada);
                    const esHoy          = esMismoDia(fecha, hoy);
                    let clases = 'calendario__celda';
                    if (esSeleccionado)      clases += ' calendario__celda--seleccionado';
                    else if (esDisponible)   clases += ' calendario__celda--disponible';
                    else if (esPasado)       clases += ' calendario__celda--pasado';
                    else                     clases += ' calendario__celda--no-disponible';
                    if (esHoy)               clases += ' calendario__celda--hoy';
                    return (
                        <button
                            key={fecha.toISOString()}
                            type="button"
                            className={clases}
                            disabled={!esDisponible}
                            onClick={() => onSeleccionarFecha(esSeleccionado ? null : fecha)}
                        >
                            {fecha.getDate()}
                        </button>
                    );
                })}
            </div>
            <div className="calendario__leyenda">
                <span className="leyenda__item leyenda__item--disponible">Disponible</span>
                <span className="leyenda__item leyenda__item--seleccionado">Seleccionado</span>
                <span className="leyenda__item leyenda__item--no-disponible">Sin atención</span>
            </div>
        </div>
    );
}

// ─── Selector de especialidades custom ───────────────────────────────────────
// Lista inline que empuja el contenido hacia abajo — no usa position:absolute
// así nunca queda cortada por el overflow del modal
function SelectorEspecialidades({ especialidades, seleccionada, onChange }) {
    const [abierto, setAbierto] = useState(false);

    const handleSelect = (esp) => {
        onChange(esp);
        setAbierto(false);
    };

    return (
        <div className="esp-selector">
            {/* Trigger */}
            <button
                type="button"
                className={`esp-selector__trigger${abierto ? ' esp-selector__trigger--abierto' : ''}`}
                onClick={() => setAbierto(v => !v)}
            >
                <span className="esp-selector__label">
                    {seleccionada ? seleccionada.nombre : '-- Seleccioná una especialidad --'}
                </span>
                <span className="esp-selector__arrow">{abierto ? '▲' : '▼'}</span>
            </button>

            {/* Lista inline con scroll — se despliega dentro del flujo del DOM */}
            {abierto && (
                <div className="esp-selector__panel">
                    <ul className="esp-selector__lista">
                        {especialidades.map(esp => (
                            <li
                                key={esp.id}
                                className={`esp-selector__item${seleccionada?.id === esp.id ? ' esp-selector__item--activo' : ''}`}
                                onClick={() => handleSelect(esp)}
                            >
                                {seleccionada?.id === esp.id && (
                                    <span className="esp-selector__check">✓</span>
                                )}
                                {esp.nombre}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export const TurnoModal = ({
    modalOpen, selected, selectedType, datetime, setDatetime,
    notes, setNotes, correo, setCorreo, loading, error,
    onClose, onConfirm, prettyType,
    especialidadPreseleccionada
}) => {
    const { t } = useTranslation();
    const [especialidades, setEspecialidades]                     = useState([]);
    const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(null);
    const [loadingEsp, setLoadingEsp]                             = useState(false);
    const [errorEsp, setErrorEsp]                                 = useState('');
    const [fechaSeleccionada, setFechaSeleccionada]               = useState(null);
    const [horaSeleccionada, setHoraSeleccionada]                 = useState('');

    useEffect(() => {
        if (!modalOpen || !selected?.establecimientoId) {
            setEspecialidades([]);
            setEspecialidadSeleccionada(null);
            return;
        }
        if (especialidadPreseleccionada?.horariosDisponibles) {
            setEspecialidadSeleccionada(especialidadPreseleccionada);
        }
        setLoadingEsp(true);
        setErrorEsp('');
        getEspecialidadesByEstablecimiento(selected.establecimientoId)
            .then(data => {
                setEspecialidades(data);
                if (especialidadPreseleccionada) {
                    const encontrada = data.find(
                        esp => esp.id === especialidadPreseleccionada.id ||
                               esp.nombre === especialidadPreseleccionada.nombre
                    );
                    setEspecialidadSeleccionada(encontrada || especialidadPreseleccionada);
                }
            })
            .catch(() => {
                setErrorEsp('No se pudieron cargar las especialidades');
                setEspecialidades([]);
            })
            .finally(() => setLoadingEsp(false));
    }, [modalOpen, selected?.establecimientoId]);

    useEffect(() => {
        if (!modalOpen) {
            setEspecialidadSeleccionada(null);
            setEspecialidades([]);
            setErrorEsp('');
            setFechaSeleccionada(null);
            setHoraSeleccionada('');
            setDatetime('');
        }
    }, [modalOpen]);

    useEffect(() => {
        if (fechaSeleccionada && horaSeleccionada) {
            const y = fechaSeleccionada.getFullYear();
            const m = String(fechaSeleccionada.getMonth() + 1).padStart(2, '0');
            const d = String(fechaSeleccionada.getDate()).padStart(2, '0');
            setDatetime(`${y}-${m}-${d}T${horaSeleccionada}`);
        } else {
            setDatetime('');
        }
    }, [fechaSeleccionada, horaSeleccionada]);

    const { diasPermitidos, franjas } = useMemo(
        () => parsearHorarios(especialidadSeleccionada?.horariosDisponibles),
        [especialidadSeleccionada?.horariosDisponibles]
    );
    const slots = useMemo(
        () => generarSlots(franjas, fechaSeleccionada),
        [franjas, fechaSeleccionada]
    );

    if (!modalOpen || !selected) return null;

    const professionalName = selected.name || t('appointments.professional');
    const vieneDelBuscador = !!especialidadPreseleccionada && !!especialidadSeleccionada;

    const handleCambiarEspecialidad = (esp) => {
        setEspecialidadSeleccionada(esp);
        setFechaSeleccionada(null);
        setHoraSeleccionada('');
        setDatetime('');
    };

    const handleConfirm = () => {
        if (!especialidadSeleccionada) { toast.error('Por favor seleccioná una especialidad'); return; }
        if (!fechaSeleccionada)        { toast.error('Por favor seleccioná una fecha'); return; }
        if (!horaSeleccionada)         { toast.error('Por favor seleccioná una hora'); return; }
        if (!correo)                   { toast.error('Por favor ingresá tu correo electrónico'); return; }
        const [fecha, hora] = datetime.split('T');
        onConfirm({
            establecimientoId:   selected.establecimientoId,
            especialidadId:      especialidadSeleccionada.id,
            especialidadNombre:  especialidadSeleccionada.nombre,
            fecha, hora,
            observaciones:       notes,
            correo,
            professionalName,
            professionalType:    selectedType,
        });
    };

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal">
                <div className="modal__header">
                    <span className="modal__title">{t('appointments.requestAppointment')}</span>
                    <button className="button button--icon modal-close" onClick={onClose}
                        aria-label={t('map.close')} title={t('map.close')}>
                        <span className="close-x" aria-hidden="true">×</span>
                    </button>
                </div>
                <div className="modal__body">
                    {selected.establecimientoNombre && selected.establecimientoId && (
                        <div className="selected-establishment">
                            <div className="selected-establishment-header">
                                <span className="est-pin">📍</span>
                                <span>Establecimiento del Mapa:</span>
                            </div>
                            <div className="selected-establishment-name">{selected.establecimientoNombre}</div>
                            <div className="selected-establishment-note">Tu turno quedará vinculado a este establecimiento</div>
                        </div>
                    )}
                    <div className="input">
                        <label className="input__label">Especialidad</label>
                        {vieneDelBuscador ? (
                            <div className="input__field input__field--readonly">
                                ✅ {especialidadSeleccionada.nombre}
                            </div>
                        ) : (
                            <>
                                {loadingEsp && (
                                    <div className="input__field">Cargando especialidades...</div>
                                )}
                                {errorEsp && (
                                    <div className="turnos-error">{errorEsp}</div>
                                )}
                                {!loadingEsp && !errorEsp && especialidades.length === 0 && (
                                    <div className="input__field">No hay especialidades disponibles</div>
                                )}
                                {!loadingEsp && especialidades.length > 0 && (
                                    <SelectorEspecialidades
                                        especialidades={especialidades}
                                        seleccionada={especialidadSeleccionada}
                                        onChange={handleCambiarEspecialidad}
                                    />
                                )}
                            </>
                        )}
                        {especialidadSeleccionada?.horariosDisponibles && (
                            <p className="input__description">
                                🕐 {especialidadSeleccionada.horariosDisponibles}
                            </p>
                        )}
                        {especialidadSeleccionada && diasPermitidos.size === 0 && (
                            <p className="input__description input__description--error">
                                ⚠️ No se pudieron interpretar los días. Consultá el horario indicado arriba.
                            </p>
                        )}
                    </div>
                    {especialidadSeleccionada && diasPermitidos.size > 0 && (
                        <div className="input">
                            <label className="input__label">Seleccioná una fecha</label>
                            <CalendarioVisual
                                diasPermitidos={diasPermitidos}
                                fechaSeleccionada={fechaSeleccionada}
                                onSeleccionarFecha={(f) => {
                                    setFechaSeleccionada(f);
                                    setHoraSeleccionada('');
                                }}
                            />
                        </div>
                    )}
                    {fechaSeleccionada && (
                        <div className="input">
                            <label className="input__label">
                                Horario — {fechaSeleccionada.toLocaleDateString('es-AR', {
                                    weekday: 'long', day: 'numeric', month: 'long'
                                })}
                            </label>
                            {slots.length === 0 ? (
                                <div className="input__field">Sin horarios disponibles para este día</div>
                            ) : (
                                <div className="slots-grilla">
                                    {slots.map(h => (
                                        <button
                                            key={h}
                                            type="button"
                                            className={`slot-btn${horaSeleccionada === h ? ' slot-btn--activo' : ''}`}
                                            onClick={() => setHoraSeleccionada(horaSeleccionada === h ? '' : h)}
                                        >
                                            {h}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {horaSeleccionada && (
                        <div className="input">
                            <label className="input__label">{t('appointments.observations')}</label>
                            <textarea
                                className="input__field input__field--textarea"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={t('appointments.observationsPlaceholder')}
                                rows="3"
                            />
                        </div>
                    )}
                </div>
                <div className="modal__footer">
                    <div className="footer-left">
                        <label className="correo__label">{t('appointments.email')}</label>
                        <input
                            type="email"
                            className="correo__field"
                            placeholder={t('appointments.emailPlaceholder')}
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                        />
                    </div>
                    <div className="footer-right">
                        <button
                            className="button button--primary"
                            onClick={handleConfirm}
                            disabled={
                                loading ||
                                !correo ||
                                !especialidadSeleccionada ||
                                !fechaSeleccionada ||
                                !horaSeleccionada
                            }
                        >
                            {loading ? t('common.processing') : t('appointments.confirmAppointment')}
                        </button>
                    </div>
                </div>
                {error && <div className="turnos-error">{error}</div>}
            </div>
        </div>
    );
};