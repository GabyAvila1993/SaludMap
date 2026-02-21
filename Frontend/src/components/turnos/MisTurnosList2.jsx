import React from 'react';
import { useTranslation } from 'react-i18next';
import IconMano from '../../assets/Icon_mano.png';
import IconHuella from '../../assets/Icon_huella.png';

export const MisTurnosList = ({ misTurnos = [], onCancelTurno, cancellingId, prettyType }) => {
    const { t } = useTranslation();

    const sortDesc = (arr = []) => [...arr].sort((a, b) => {
        const ta = Date.parse(a.datetime || a.fecha || '') || 0;
        const tb = Date.parse(b.datetime || b.fecha || '') || 0;
        return tb - ta;
    });

    const pendientes  = sortDesc(misTurnos.filter(m => (m.estado || 'pendiente') === 'pendiente'));
    const completados = sortDesc(misTurnos.filter(m => ['completado', 'finalizado'].includes(m.estado || '')));
    const cancelados  = sortDesc(misTurnos.filter(m => (m.estado || '') === 'cancelado'));

    const formatDatetime = (dt) => {
        if (!dt) return '';
        try {
            return new Date(dt).toLocaleString('es-AR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch { return dt; }
    };

    const renderCard = (turno) => {
        const estado = turno.estado || 'pendiente';
        const badgeClass =
            estado === 'pendiente' ? 'badge-pending'   :
            estado === 'cancelado' ? 'badge-cancelled' :
            'badge-completed';
        const cardClass =
            estado === 'pendiente' ? 'status-pending'  :
            estado === 'cancelado' ? 'status-cancelled' : '';
        const badgeLabel =
            estado === 'pendiente' ? t('appointments.pending',   'Pendiente')  :
            estado === 'cancelado' ? t('appointments.cancelled', 'Cancelado')  :
            t('appointments.completed', 'Completado');

        return (
            <div key={turno.id} className={`turn-card-figma ${cardClass}`}>
                <span className={`turn-card-status ${badgeClass}`}>{badgeLabel}</span>
                <div className="turn-card-title">{turno.professionalName}</div>
                <div className="turn-card-type">{prettyType(turno.professionalType)}</div>
                <hr className="turn-card-divider" />
                <div className="turn-card-datetime">📅 {formatDatetime(turno.datetime)}</div>
                {estado === 'pendiente' && (
                    <div className="turn-card-actions">
                        <button
                            className="btn-cancel-card"
                            onClick={() => onCancelTurno(turno.id)}
                            disabled={cancellingId === turno.id}
                        >
                            {cancellingId === turno.id
                                ? t('appointments.cancelling', 'Cancelando...')
                                : t('appointments.cancel', 'Cancelar Turno')}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const grupos = [
        {
            key: 'pending',
            label: t('appointments.pending', 'Pendiente'),
            items: pendientes,
            emptyMsg: t('appointments.noPending', 'No tenés turnos pendientes'),
        },
        {
            key: 'completed',
            label: t('appointments.completed', 'Completado'),
            items: completados,
            emptyMsg: t('appointments.noCompleted', 'No tenés turnos completados'),
        },
        {
            key: 'cancelled',
            label: t('appointments.cancelled', 'Cancelado'),
            items: cancelados,
            emptyMsg: t('appointments.noCancelled', 'No tenés turnos cancelados'),
        },
    ];

    return (
        <div className="turnos-right">
            {/* Imágenes decorativas de fondo */}
            <img src={IconMano}   alt="" aria-hidden="true" className="mis-turnos-bg-img mis-turnos-bg-img--mano" />
            <img src={IconHuella} alt="" aria-hidden="true" className="mis-turnos-bg-img mis-turnos-bg-img--huella" />

            {/* Contenido encima del fondo */}
            <div className="mis-turnos-content">
                <div className="mis-turnos-header">
                    <h4>{t('appointments.myAppointments', 'Mis Turnos')}</h4>
                </div>

                {grupos.map(({ key, label, items, emptyMsg }) => (
                    <section key={key} className="turnos-group">
                        <h5>{label}</h5>
                        {items.length === 0
                            ? <p className="turnos-empty-msg">{emptyMsg}</p>
                            : items.map(renderCard)
                        }
                    </section>
                ))}
            </div>
        </div>
    );
};