// INICIO CAMBIO - Archivo: src/components/ProfesionalesList2.jsx - Actualizado para nueva estructura
import React from 'react';

export const ProfesionalesList = ({ lugares, loading, error, onOpenModal, getTypeFromPlace, prettyType }) => {
    return (
        <div className="turnos-left">
            <h4>Profesionales cercanos</h4>
            {loading && <div>Cargando profesionales...</div>}
            {error && <div className="turnos-error">{error}</div>}
            {!loading && lugares.length === 0 && <div>No se encontraron profesionales cerca.</div>}
            <ul className="prof-list">
                {lugares.map((p, i) => {
                    // Usar la estructura normalizada del nuevo servicio
                    const name = p.name || 'Profesional sin nombre';
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
                                        {p.source === 'mock' ? '(Demo)' :
                                            p.source === 'cache' ? '(Guardado)' :
                                                `(${p.source})`}
                                    </div>
                                )}
                            </div>
                            <div>
                                <button
                                    className="btn-primary"
                                    onClick={() => onOpenModal(p)}
                                    title={`Solicitar turno con ${name}`}
                                >
                                    Solicitar Turno
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