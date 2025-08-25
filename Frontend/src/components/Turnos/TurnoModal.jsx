import React, { useState } from 'react';

export default function TurnoModal({ open, profesional, tipo, onClose, onConfirm }) {
    const [datetime, setDatetime] = useState('');
    const [notes, setNotes] = useState('');

    if (!open || !profesional) return null;

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal">
                <div className="modal__header">
                    <span className="modal__title">Solicitar turno</span>
                    <button className="button button--icon modal-close" onClick={onClose} aria-label="Cerrar" title="Cerrar">
                        <span className="close-x" aria-hidden="true">×</span>
                    </button>
                </div>
                <div className="modal__body">
                    <div className="input">
                        <label className="input__label">Profesional</label>
                        <div className="input__field">{profesional.tags?.name ?? profesional.properties?.name ?? 'Profesional'}</div>
                        <p className="input__description">{profesional.tags?.addr_full ?? profesional.tags?.address ?? ''}</p>
                    </div>
                    <div className="input">
                        <label className="input__label">Tipo</label>
                        <div className="input__field">{tipo}</div>
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
                                    <path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H5V9h14zM7 11h5v5H7z" />
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
                    <button className="button button--primary" onClick={() => onConfirm({ datetime, notes })}>Confirmar turno</button>
                </div>
            </div>
        </div>
    );
}
