// INICIO CAMBIO - Archivo: src/components/ProfesionalesList2.jsx - Actualizado para nueva estructura
import React from 'react';
import { useTranslation } from 'react-i18next';

export const ProfesionalesList = ({ lugares, loading, error, onOpenModal, getTypeFromPlace, prettyType }) => {
    const { t } = useTranslation();
    
    return (
        <div className="turnos-left">
            <h4>{t('appointments.nearbyProfessionals')}</h4>
            {loading && <div>{t('appointments.loadingProfessionals')}</div>}
            {error && <div className="turnos-error">{error}</div>}
            {!loading && lugares.length === 0 && <div>{t('appointments.noProfessionalsFound')}</div>}
            <ul className="prof-list">
                {lugares.map((p, i) => {
                    // Usar la estructura normalizada del nuevo servicio
                    const name = p.name || t('appointments.professionalWithoutName');
                    const addr = p.address || '';
                    const tipo = getTypeFromPlace(p);
                    
                    return (
                        <li key={p.id || i} className="prof-item">
                            <div className="prof-info">
                                <div className="prof-name">{name}</div>
                                {addr && <div className="prof-addr">{addr}</div>}
                                <div className="prof-type">{prettyType(tipo)}</div>
                                {p.source && p.source !== 'api' && (
                                    <div className="prof-source">
                                        {p.source === 'mock' ? t('appointments.source.demo') : 
                                         p.source === 'cache' ? t('appointments.source.saved') : 
                                         `(${p.source})`}
                                    </div>
                                )}
                            </div>
                            <div>
                                <button 
                                    className="btn-primary" 
                                    onClick={() => onOpenModal(p)}
                                    title={`${t('appointments.requestAppointment')} ${name}`}
                                >
                                    {t('appointments.requestAppointment')}
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
// FIN CAMBIO - Archivo: src/components/ProfesionalesList2.jsx