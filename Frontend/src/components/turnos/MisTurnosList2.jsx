import React from 'react';
import { useTranslation } from 'react-i18next';

export const MisTurnosList = ({ misTurnos = [], onCancelTurno, cancellingId, prettyType }) => {
    const { t } = useTranslation();

    const sortDesc = (arr = []) => [...arr].sort((a, b) => {
        const ta = Date.parse(a.datetime || a.fecha || '') || 0;
        const tb = Date.parse(b.datetime || b.fecha || '') || 0;
        return tb - ta;
    });

    const pendientes = sortDesc(misTurnos.filter(m => (m.estado || 'pendiente') === 'pendiente'));
    const cancelados = sortDesc(misTurnos.filter(m => (m.estado || '') === 'cancelado'));
    const completados = sortDesc(misTurnos.filter(m => (m.estado || '') === 'completado' || (m.estado || '') === 'finalizado'));

    const renderTurnoItem = (turno) => (
        <li key={turno.id} className="turn-item">
            <div>
                <strong>{turno.professionalName}</strong>
                <div style={{ fontSize: 12, color: '#666' }}>{prettyType(turno.professionalType)}</div>
            </div>
            <div>{turno.datetime ? new Date(turno.datetime).toLocaleString() : ''}</div>
            <div className="turn-actions">
                { (turno.estado || 'pendiente') === 'pendiente' && (
                    <button
                        className="btn-ghost"
                        onClick={() => onCancelTurno(turno.id)}
                        disabled={cancellingId === turno.id}
                    >
                        {cancellingId === turno.id ? t('appointments.cancelling') : t('appointments.cancel')}
                    </button>
                )}
            </div>
        </li>
    );

    return (
        <div className="turnos-right">
            <h4>{t('appointments.myAppointments')}</h4>

            <section className="turnos-group">
                <h5>{t('appointments.pending')}</h5>
                {pendientes.length === 0 ? <div>{t('appointments.noPending')}</div> : (
                    <ul className="my-turns">{pendientes.map(renderTurnoItem)}</ul>
                )}
            </section>

            <section className="turnos-group">
                <h5>{t('appointments.completed')}</h5>
                {completados.length === 0 ? <div>{t('appointments.noCompleted')}</div> : (
                    <ul className="my-turns">{completados.map(renderTurnoItem)}</ul>
                )}
            </section>

            <section className="turnos-group">
                <h5>{t('appointments.cancelled')}</h5>
                {cancelados.length === 0 ? <div>{t('appointments.noCancelled')}</div> : (
                    <ul className="my-turns">{cancelados.map(renderTurnoItem)}</ul>
                )}
            </section>
        </div>
    );
};
