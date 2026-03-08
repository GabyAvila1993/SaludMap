// Archivo: src/components/TurnoModal2.jsx
import React, { useEffect, useState } from 'react';
import './TurnoModal2.css';
import { useTranslation } from 'react-i18next';
import { getEspecialidadesByEstablecimiento } from '../../services/especialidadesService.js';

export const TurnoModal = ({
    modalOpen,
    selected,
    selectedType,
    datetime,
    setDatetime,
    notes,
    setNotes,
    correo,
    setCorreo,
    loading,
    error,
    onClose,
    onConfirm,
    prettyType
}) => {
    const { t } = useTranslation();

    const [especialidades, setEspecialidades] = useState([]);
    const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(null);
    const [loadingEspecialidades, setLoadingEspecialidades] = useState(false);
    const [errorEspecialidades, setErrorEspecialidades] = useState('');

    // Cargar especialidades cuando se abre el modal y hay un establecimiento
    useEffect(() => {
        if (!modalOpen || !selected?.establecimientoId) {
            setEspecialidades([]);
            setEspecialidadSeleccionada(null);
            return;
        }

        const cargarEspecialidades = async () => {
            setLoadingEspecialidades(true);
            setErrorEspecialidades('');
            try {
                const data = await getEspecialidadesByEstablecimiento(selected.establecimientoId);
                setEspecialidades(data);
            } catch {
                setErrorEspecialidades('No se pudieron cargar las especialidades');
                setEspecialidades([]);
            } finally {
                setLoadingEspecialidades(false);
            }
        };

        cargarEspecialidades();
    }, [modalOpen, selected?.establecimientoId]);

    // Limpiar especialidad seleccionada al cerrar
    useEffect(() => {
        if (!modalOpen) {
            setEspecialidadSeleccionada(null);
            setEspecialidades([]);
            setErrorEspecialidades('');
        }
    }, [modalOpen]);

    if (!modalOpen || !selected) return null;

    const professionalName = selected.name || t('appointments.professional');
    const professionalAddress = selected.address || '';

    const handleConfirm = () => {
        if (!especialidadSeleccionada) {
            alert('Por favor seleccioná una especialidad');
            return;
        }
        if (!datetime) {
            alert('Por favor seleccioná fecha y hora');
            return;
        }
        if (!correo) {
            alert('Por favor ingresá tu correo electrónico');
            return;
        }

        const [fecha, hora] = datetime.split('T');

        const datos = {
            establecimientoId: selected.establecimientoId,
            especialidadId: especialidadSeleccionada.id,       // NUEVO
            especialidadNombre: especialidadSeleccionada.nombre, // NUEVO
            fecha: fecha,
            hora: hora,
            observaciones: notes,
            correo: correo,
            professionalName: professionalName,
            professionalType: selectedType
        };

        onConfirm(datos);
    };

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal">
                <div className="modal__header">
                    <span className="modal__title">{t('appointments.requestAppointment')}</span>
                    <button
                        className="button button--icon modal-close"
                        onClick={onClose}
                        aria-label={t('map.close')}
                        title={t('map.close')}
                    >
                        <span className="close-x" aria-hidden="true">×</span>
                    </button>
                </div>

                <div className="modal__body">
                    {/* Establecimiento seleccionado desde el mapa */}
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

                    {/* NUEVO: Selector de Especialidad (reemplaza al campo "Profesional") */}
                    <div className="input">
                        <label className="input__label">Especialidad</label>

                        {loadingEspecialidades && (
                            <div className="input__field">Cargando especialidades...</div>
                        )}

                        {errorEspecialidades && (
                            <div className="turnos-error">{errorEspecialidades}</div>
                        )}

                        {!loadingEspecialidades && !errorEspecialidades && especialidades.length === 0 && (
                            <div className="input__field">No hay especialidades disponibles para este establecimiento</div>
                        )}

                        {!loadingEspecialidades && especialidades.length > 0 && (
                            <select
                                className="input__field"
                                value={especialidadSeleccionada?.id || ''}
                                onChange={(e) => {
                                    const id = parseInt(e.target.value, 10);
                                    const esp = especialidades.find(es => es.id === id) || null;
                                    setEspecialidadSeleccionada(esp);
                                    // Limpiar fecha/hora al cambiar especialidad
                                    setDatetime('');
                                }}
                            >
                                <option value="">-- Seleccioná una especialidad --</option>
                                {especialidades.map(esp => (
                                    <option key={esp.id} value={esp.id}>
                                        {esp.nombre}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Mostrar descripción y horarios disponibles de la especialidad seleccionada */}
                        {especialidadSeleccionada && (
                            <div className="especialidad-info">
                                {especialidadSeleccionada.descripcion && (
                                    <p className="input__description">{especialidadSeleccionada.descripcion}</p>
                                )}
                                {especialidadSeleccionada.horariosDisponibles && (
                                    <p className="input__description">
                                        🕐 Horarios disponibles: {especialidadSeleccionada.horariosDisponibles}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tipo de servicio — solo se muestra si hay especialidad seleccionada */}
                    {especialidadSeleccionada && (
                        <div className="input">
                            <label className="input__label">{t('appointments.serviceType')}</label>
                            <div className="input__field">{prettyType(selectedType)}</div>
                        </div>
                    )}

                    {/* Fecha y hora — solo se muestra si hay especialidad seleccionada */}
                    {especialidadSeleccionada && (
                        <div className="input">
                            <label className="input__label">{t('appointments.dateTime')}</label>
                            <div className="input-with-icon">
                                <input
                                    id="turnos-datetime"
                                    className="input__field"
                                    type="datetime-local"
                                    value={datetime}
                                    onChange={(e) => setDatetime(e.target.value)}
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                                <button
                                    type="button"
                                    className="calendar-btn"
                                    onClick={() => {
                                        const el = document.getElementById('turnos-datetime');
                                        if (el && typeof el.showPicker === 'function') {
                                            el.showPicker();
                                        } else {
                                            el?.focus();
                                        }
                                    }}
                                    aria-label={t('appointments.openDatePicker')}
                                    title={t('appointments.openDatePicker')}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path fill="none" d="M0 0h24v24H0z" />
                                        <path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V9h14v9zM7 11h5v5H7v-5z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Observaciones — solo se muestra si hay especialidad seleccionada */}
                    {especialidadSeleccionada && (
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
                            disabled={loading || !correo || !datetime || !especialidadSeleccionada}
                        >
                            {loading ? t('common.processing') : t('appointments.confirmAppointment')}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="turnos-error">{error}</div>
                )}
            </div>
        </div>
    );
};