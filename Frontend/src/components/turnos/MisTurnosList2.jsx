import React from 'react';
import { useTranslation } from 'react-i18next';

export const MisTurnosList = ({ misTurnos, onCancelTurno, cancellingId, prettyType }) => {
    const { t } = useTranslation();
    
    return (
        <div className="turnos-right">
            <h4>{t('appointments.myAppointments')}</h4>
            {!Array.isArray(misTurnos) || misTurnos.length === 0 ? (
                <div>{t('appointments.noAppointmentsRegistered')}</div>
            ) : (
                <ul className="my-turns">
                    {misTurnos.map((turno) => (
                        <li key={turno.id} className="turn-item">
                            <div>
                                <strong>{turno.professionalName}</strong>
                                <div style={{ fontSize: 12, color: '#666' }}>{prettyType(turno.professionalType)}</div>
                            </div>
                            <div>{new Date(turno.datetime).toLocaleString()}</div>
                            <div className="turn-actions">
                                <button
                                    className="btn-ghost"
                                    onClick={() => onCancelTurno(turno.id)}
                                    disabled={cancellingId === turno.id}
                                >
                                    {cancellingId === turno.id ? t('appointments.cancelling') : t('appointments.cancel')}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
