// Archivo: src/components/TurnoModal2.jsx
import React, { useEffect, useState, useMemo } from 'react';
import './TurnoModal2.css';
import { useTranslation } from 'react-i18next';
import { getEspecialidadesByEstablecimiento } from '../../services/especialidadesService.js';

// ─── Días de la semana en español → número JS (0=Dom ... 6=Sab) ─────────────
const DIAS_MAP = {
    'lunes': 1, 'martes': 2, 'miércoles': 3, 'miercoles': 3,
    'jueves': 4, 'viernes': 5, 'sábado': 6, 'sabado': 6, 'domingo': 0,
};
const NOMBRES_DIA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const NOMBRES_MES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                     'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const parsearHorarios = (horariosStr) => {
    if (!horariosStr) return { diasPermitidos: new Set(), franjas: [] };
    const franjas = [];
    const diasPermitidos = new Set();
    for (const bloque of horariosStr.split('|').map(b => b.trim())) {
        const horaMatch = bloque.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
        const desde = horaMatch ? horaMatch[1] : '08:00';
        const hasta = horaMatch ? horaMatch[2] : '18:00';
        const textoDias = (horaMatch
            ? bloque.substring(0, bloque.indexOf(horaMatch[0]))
            : bloque).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const diasBloque = new Set();
        const rangoMatch = textoDias.match(/(\w+)\s+a\s+(\w+)/);
        if (rangoMatch) {
            const k1 = rangoMatch[1].normalize('NFD').replace(/[\u0300-\u036f]/g,'');
            const k2 = rangoMatch[2].normalize('NFD').replace(/[\u0300-\u036f]/g,'');
            const ini = DIAS_MAP[k1]; const fin = DIAS_MAP[k2];
            if (ini !== undefined && fin !== undefined)
                for (let d = ini; d <= fin; d++) { diasBloque.add(d); diasPermitidos.add(d); }
        }
        for (const [nombre, num] of Object.entries(DIAS_MAP)) {
            const k = nombre.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
            if (textoDias.includes(k)) { diasBloque.add(num); diasPermitidos.add(num); }
        }
        franjas.push({ dias: diasBloque, desde, hasta });
    }
    return { diasPermitidos, franjas };
};

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
            slots.push(`${String(Math.floor(min/60)).padStart(2,'0')}:${String(min%60).padStart(2,'0')}`);
            min += 15;
        }
    }
    return slots;
};

// ─── Componente Calendario Visual ───────────────────────────────────────────
function CalendarioVisual({ diasPermitidos, fechaSeleccionada, onSeleccionarFecha }) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const [anio, setAnio] = useState(hoy.getFullYear());
    const [mes, setMes]   = useState(hoy.getMonth());

    const irAnterior = () => mes === 0 ? (setMes(11), setAnio(a => a-1)) : setMes(m => m-1);
    const irSiguiente = () => mes === 11 ? (setMes(0), setAnio(a => a+1)) : setMes(m => m+1);

    const primerDia  = new Date(anio, mes, 1).getDay();
    const diasEnMes  = new Date(anio, mes + 1, 0).getDate();

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
                    const esPasado      = fecha < hoy;
                    const esDisponible  = !esPasado && diasPermitidos.has(fecha.getDay());
                    const esSeleccionado = esMismoDia(fecha, fechaSeleccionada);
                    const esHoy         = esMismoDia(fecha, hoy);

                    let clases = 'calendario__celda';
                    if (esSeleccionado)       clases += ' calendario__celda--seleccionado';
                    else if (esDisponible)    clases += ' calendario__celda--disponible';
                    else if (esPasado)        clases += ' calendario__celda--pasado';
                    else                      clases += ' calendario__celda--no-disponible';
                    if (esHoy)                clases += ' calendario__celda--hoy';

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

// ─────────────────────────────────────────────────────────────────────────────

export const TurnoModal = ({
    modalOpen, selected, selectedType, datetime, setDatetime,
    notes, setNotes, correo, setCorreo, loading, error,
    onClose, onConfirm, prettyType
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
            setEspecialidades([]); setEspecialidadSeleccionada(null); return;
        }
        setLoadingEsp(true); setErrorEsp('');
        getEspecialidadesByEstablecimiento(selected.establecimientoId)
            .then(data => setEspecialidades(data))
            .catch(() => { setErrorEsp('No se pudieron cargar las especialidades'); setEspecialidades([]); })
            .finally(() => setLoadingEsp(false));
    }, [modalOpen, selected?.establecimientoId]);

    useEffect(() => {
        if (!modalOpen) {
            setEspecialidadSeleccionada(null); setEspecialidades([]);
            setErrorEsp(''); setFechaSeleccionada(null);
            setHoraSeleccionada(''); setDatetime('');
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
        [especialidadSeleccionada]
    );
    const slots = useMemo(() => generarSlots(franjas, fechaSeleccionada), [franjas, fechaSeleccionada]);

    if (!modalOpen || !selected) return null;

    const professionalName = selected.name || t('appointments.professional');

    const handleCambiarEspecialidad = (e) => {
        const esp = especialidades.find(es => es.id === parseInt(e.target.value, 10)) || null;
        setEspecialidadSeleccionada(esp);
        setFechaSeleccionada(null); setHoraSeleccionada(''); setDatetime('');
    };

    const handleConfirm = () => {
        if (!especialidadSeleccionada) { alert('Por favor seleccioná una especialidad'); return; }
        if (!fechaSeleccionada)        { alert('Por favor seleccioná una fecha'); return; }
        if (!horaSeleccionada)         { alert('Por favor seleccioná una hora'); return; }
        if (!correo)                   { alert('Por favor ingresá tu correo electrónico'); return; }
        const [fecha, hora] = datetime.split('T');
        onConfirm({
            establecimientoId:  selected.establecimientoId,
            especialidadId:     especialidadSeleccionada.id,
            especialidadNombre: especialidadSeleccionada.nombre,
            fecha, hora, observaciones: notes, correo,
            professionalName, professionalType: selectedType,
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

                    {/* Especialidad */}
                    <div className="input">
                        <label className="input__label">Especialidad</label>
                        {loadingEsp && <div className="input__field">Cargando especialidades...</div>}
                        {errorEsp   && <div className="turnos-error">{errorEsp}</div>}
                        {!loadingEsp && !errorEsp && especialidades.length === 0 && (
                            <div className="input__field">No hay especialidades disponibles</div>
                        )}
                        {!loadingEsp && especialidades.length > 0 && (
                            <select className="input__field" value={especialidadSeleccionada?.id || ''}
                                onChange={handleCambiarEspecialidad}>
                                <option value="">-- Seleccioná una especialidad --</option>
                                {especialidades.map(esp => (
                                    <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                                ))}
                            </select>
                        )}
                        {especialidadSeleccionada?.horariosDisponibles && (
                            <p className="input__description">
                                🕐 {especialidadSeleccionada.horariosDisponibles}
                            </p>
                        )}
                    </div>

                    {/* Calendario */}
                    {especialidadSeleccionada && (
                        <div className="input">
                            <label className="input__label">Seleccioná una fecha</label>
                            <CalendarioVisual
                                diasPermitidos={diasPermitidos}
                                fechaSeleccionada={fechaSeleccionada}
                                onSeleccionarFecha={(f) => { setFechaSeleccionada(f); setHoraSeleccionada(''); }}
                            />
                        </div>
                    )}

                    {/* Slots de hora */}
                    {fechaSeleccionada && (
                        <div className="input">
                            <label className="input__label">
                                Horario — {fechaSeleccionada.toLocaleDateString('es-AR', {
                                    weekday: 'long', day: 'numeric', month: 'long'
                                })}
                            </label>
                            {slots.length === 0
                                ? <div className="input__field">Sin horarios disponibles</div>
                                : (
                                    <div className="slots-grilla">
                                        {slots.map(h => (
                                            <button key={h} type="button"
                                                className={`slot-btn${horaSeleccionada === h ? ' slot-btn--activo' : ''}`}
                                                onClick={() => setHoraSeleccionada(horaSeleccionada === h ? '' : h)}>
                                                {h}
                                            </button>
                                        ))}
                                    </div>
                                )
                            }
                        </div>
                    )}

                    {/* Observaciones */}
                    {horaSeleccionada && (
                        <div className="input">
                            <label className="input__label">{t('appointments.observations')}</label>
                            <textarea className="input__field input__field--textarea"
                                value={notes} onChange={(e) => setNotes(e.target.value)}
                                placeholder={t('appointments.observationsPlaceholder')} rows="3" />
                        </div>
                    )}
                </div>

                <div className="modal__footer">
                    <div className="footer-left">
                        <label className="correo__label">{t('appointments.email')}</label>
                        <input type="email" className="correo__field"
                            placeholder={t('appointments.emailPlaceholder')}
                            value={correo} onChange={(e) => setCorreo(e.target.value)} required />
                    </div>
                    <div className="footer-right">
                        <button className="button button--primary" onClick={handleConfirm}
                            disabled={loading || !correo || !fechaSeleccionada || !horaSeleccionada || !especialidadSeleccionada}>
                            {loading ? t('common.processing') : t('appointments.confirmAppointment')}
                        </button>
                    </div>
                </div>

                {error && <div className="turnos-error">{error}</div>}
            </div>
        </div>
    );
};