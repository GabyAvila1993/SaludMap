// INICIO CAMBIO - Archivo: src/components/TurnoModal2.jsx - Modal actualizado
import React from 'react';
import { useTranslation } from 'react-i18next';

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
    
    if (!modalOpen || !selected) return null;

    // Obtener datos del profesional usando la nueva estructura normalizada
    const professionalName = selected.name || t('appointments.professional');
    const professionalAddress = selected.address || '';
    const professionalType = prettyType(selectedType);

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
                    <div className="input">
                        <label className="input__label">{t('appointments.professional')}</label>
                        <div className="input__field">{professionalName}</div>
                        {professionalAddress && (
                            <p className="input__description">{professionalAddress}</p>
                        )}
                        {selected.source && selected.source !== 'api' && (
                            <p className="input__description">
                                {selected.source === 'mock' ? t('appointments.source.demo') : 
                                    selected.source === 'cache' ? t('appointments.source.saved') : 
                                    selected.source}
                            </p>
                        )}
                    </div>

                    <div className="input">
                        <label className="input__label">{t('appointments.serviceType')}</label>
                        <div className="input__field">{professionalType}</div>
                    </div>

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
                                style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--color-primary)',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V9h14v9zM7 11h5v5H7v-5z" />
                                </svg>
                            </button>
                        </div>
                    </div>

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
                            onClick={onConfirm}
                            disabled={loading || !correo || !datetime}
                        >
                            {loading ? t('common.processing') : t('appointments.confirmAppointment')}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="turnos-error" style={{ marginTop: '1rem' }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

// Estilos adicionales para el modal (si necesitas añadir al CSS)
const additionalStyles = `
.input-with-icon {
    position: relative;
    display: flex;
    align-items: center;
}

.input-with-icon .input__field {
    width: 100%;
    padding-right: 40px;
}

.calendar-btn:hover {
    color: #fff;
    transform: translateY(-50%) scale(1.1);
}
`;

// Inyectar estilos adicionales si no existen
if (typeof document !== 'undefined' && !document.getElementById('turno-modal-styles')) {
    const style = document.createElement('style');
    style.id = 'turno-modal-styles';
    style.textContent = additionalStyles;
    document.head.appendChild(style);
}
// FIN CAMBIO - Archivo: src/components/TurnoModal2.jsx