import React from 'react';

export default function MisTurnosList({ turnos, onCancelar }) {
  if (!Array.isArray(turnos) || turnos.length === 0) {
    return <div>No tenés turnos registrados.</div>;
  }
  return (
    <ul className="my-turns">
      {turnos.map((t) => (
        <li key={t.id} className="turn-item">
          <div>
            <strong>{t.professionalName}</strong>
            <div style={{ fontSize: 12, color: '#666' }}>{t.professionalType}</div>
          </div>
          <div>{new Date(t.datetime).toLocaleString()}</div>
          <div className="turn-actions">
            <button className="btn-ghost" onClick={() => onCancelar(t.id)}>Cancelar</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
