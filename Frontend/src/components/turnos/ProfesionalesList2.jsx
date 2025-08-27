import React from 'react';

export const ProfesionalesList = ({ lugares, loading, error, onOpenModal, getTypeFromPlace, prettyType }) => {
    return (
        <div className="turnos-left">
            <h4>Profesionales cercanos</h4>
            {loading && <div>Cargando...</div>}
            {error && <div className="turnos-error">{error}</div>}
            {!loading && lugares.length === 0 && <div>No se encontraron profesionales.</div>}
            <ul className="prof-list">
                {lugares.map((p, i) => {
                    const name = p.tags?.name ?? p.properties?.name ?? 'Sin nombre';
                    const addr = p.tags?.addr_full ?? p.tags?.address ?? '';
                    const tipo = getTypeFromPlace(p);
                    return (
                        <li key={i} className="prof-item">
                            <div className="prof-info">
                                <div className="prof-name">{name}</div>
                                {addr && <div className="prof-addr">{addr}</div>}
                                <div className="prof-type">{prettyType(tipo)}</div>
                            </div>
                            <div>
                                <button className="btn-primary" onClick={() => onOpenModal(p)}>Solicitar Turnos</button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};