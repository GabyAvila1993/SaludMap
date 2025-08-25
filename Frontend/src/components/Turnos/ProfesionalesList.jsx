import React from 'react';

export default function ProfesionalesList({ lugares, onSolicitar }) {
  if (!lugares || lugares.length === 0) {
    return <div>No se encontraron profesionales.</div>;
  }
  return (
    <ul className="prof-list">
      {lugares.map((p, i) => {
        const name = p.tags?.name ?? p.properties?.name ?? 'Sin nombre';
        const addr = p.tags?.addr_full ?? p.tags?.address ?? '';
        const tipo = p.tipo || 'default';
        return (
          <li key={i} className="prof-item">
            <div className="prof-info">
              <div className="prof-name">{name}</div>
              {addr && <div className="prof-addr">{addr}</div>}
              <div className="prof-type">{tipo}</div>
            </div>
            <div>
              <button className="btn-primary" onClick={() => onSolicitar(p)}>Solicitar Turno</button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
