import React from 'react';

export const MisTurnosList = ({ misTurnos, onCancelTurno, cancellingId, prettyType }) => {
    return (
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
                                <button
                                    className="btn-ghost"
                                    onClick={() => onCancelTurno(t.id)}
                                    disabled={cancellingId === t.id}
                                >
                                    {cancellingId === t.id ? 'Cancelando...' : 'Cancelar'}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
