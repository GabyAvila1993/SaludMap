import React from 'react';

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
    if (!modalOpen || !selected) return null;

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal">
                <div className="modal__header">
                    <span className="modal__title">Solicitar turno</span>
                    <button
                        className="button button--icon modal-close"
                        onClick={onClose}
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
                                aria-label="Abrir selector de fecha"
                                title="Abrir selector de fecha"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H5V9h14zM7 11h5v5H7z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="input">
                        <label className="input__label">Observaciones (opcional)</label>
                        <textarea
                            className="input__field input__field--textarea"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ingrese cualquier observación adicional..."
                        />
                    </div>
                </div>

                <div className="modal__footer">
                    <div className="footer-left">
                        <label className="correo__label">Correo electrónico</label>
                        <input
                            type="email"
                            className="correo__field"
                            placeholder="usuario@ejemplo.com"
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
                            {loading ? 'Procesando...' : 'Confirmar turno'}
                        </button>
                    </div>
                </div>

                {error && <div className="turnos-error" style={{ margin: '10px' }}>{error}</div>}
            </div>
        </div>
    );
};