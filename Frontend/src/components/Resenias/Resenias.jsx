import React from 'react';
import './Resenias.css';

/**
 * Componente para renderizar estrellas
 */
const Estrellas = ({ puntuacion, size = 'medium' }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className={`star ${i <= puntuacion ? 'filled' : 'empty'} ${size}`}
      >
        ★
      </span>
    );
  }
  return <div className="estrellas">{stars}</div>;
};

/**
 * Componente individual para una reseña
 */
const ReseniaItem = ({ resenia }) => {
  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="resenia-item">
      <div className="resenia-header">
        <div className="resenia-usuario">
          <div className="usuario-avatar">
            {resenia.usuario.nombre.charAt(0)}
            {resenia.usuario.apellido.charAt(0)}
          </div>
          <div className="usuario-info">
            <div className="usuario-nombre">
              {resenia.usuario.nombre} {resenia.usuario.apellido}
            </div>
            <div className="resenia-fecha">{formatearFecha(resenia.createdAt)}</div>
          </div>
        </div>
        <Estrellas puntuacion={resenia.puntuacion} size="small" />
      </div>
      <div className="resenia-comentario">{resenia.comentario}</div>
    </div>
  );
};

/**
 * Componente principal para mostrar lista de reseñas
 */
export default function Resenias({ resenias, promedioEstrellas, totalResenias, loading }) {
  if (loading) {
    return (
      <div className="resenias-container">
        <div className="loading-resenias">Cargando reseñas...</div>
      </div>
    );
  }

  if (!resenias || resenias.length === 0) {
    return (
      <div className="resenias-container">
        <div className="no-resenias">
          <p>📝 Aún no hay reseñas para este establecimiento</p>
          <p className="no-resenias-subtitle">Sé el primero en dejar tu opinión</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resenias-container">
      <div className="resenias-header">
        <h3>Reseñas ({totalResenias})</h3>
        {totalResenias > 0 && (
          <div className="promedio-container">
            <div className="promedio-numero">{promedioEstrellas}</div>
            <Estrellas puntuacion={Math.round(promedioEstrellas)} size="medium" />
            <div className="promedio-texto">
              Promedio de {totalResenias} {totalResenias === 1 ? 'reseña' : 'reseñas'}
            </div>
          </div>
        )}
      </div>

      <div className="resenias-lista">
        {resenias.map((resenia) => (
          <ReseniaItem key={resenia.id} resenia={resenia} />
        ))}
      </div>
    </div>
  );
}

export { Estrellas };
