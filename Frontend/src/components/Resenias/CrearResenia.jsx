import React, { useState, useEffect } from 'react';
import { useTurnosParaReseniar } from '../../hooks/useResenias';
import { Estrellas } from './Resenias';
import reseniasService from '../../services/reseniasService';
import './CrearResenia.css';

/**
 * Selector de estrellas interactivo
 */
const SelectorEstrellas = ({ puntuacion, onChange }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="selector-estrellas">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-button ${star <= (hover || puntuacion) ? 'filled' : 'empty'}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
        >
          ★
        </button>
      ))}
      <span className="puntuacion-texto">
        {puntuacion > 0 ? `${puntuacion} de 5 estrellas` : 'Selecciona una puntuación'}
      </span>
    </div>
  );
};

/**
 * Componente para crear una nueva reseña
 */
export default function CrearResenia({ establecimientoId, onSuccess, onCancel }) {
  const { turnos, loading: loadingTurnos } = useTurnosParaReseniar(establecimientoId);
  
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Seleccionar automáticamente el turno si solo hay uno
  useEffect(() => {
    if (turnos && turnos.length === 1) {
      setTurnoSeleccionado(turnos[0].id);
    }
  }, [turnos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!turnoSeleccionado) {
      setError('Debe seleccionar un turno');
      return;
    }

    if (puntuacion === 0) {
      setError('Debe seleccionar una puntuación');
      return;
    }

    if (!comentario.trim()) {
      setError('Debe escribir un comentario');
      return;
    }

    if (comentario.trim().length < 10) {
      setError('El comentario debe tener al menos 10 caracteres');
      return;
    }

    setSubmitting(true);

    try {
      await reseniasService.crearResenia(
        turnoSeleccionado,
        establecimientoId,
        puntuacion,
        comentario.trim()
      );

      setSuccess(true);
      
      // Llamar al callback de éxito después de un breve delay
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      console.error('Error creando reseña:', err);
      setError(err.response?.data?.message || err.message || 'Error al crear la reseña');
    } finally {
      setSubmitting(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (success) {
    return (
      <div className="crear-resenia-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h3>¡Reseña publicada con éxito!</h3>
          <p>Gracias por compartir tu experiencia</p>
        </div>
      </div>
    );
  }

  if (loadingTurnos) {
    return (
      <div className="crear-resenia-container">
        <div className="loading">Cargando información...</div>
      </div>
    );
  }

  if (!turnos || turnos.length === 0) {
    return (
      <div className="crear-resenia-container">
        <div className="no-turnos">
          <p>⚠️ No tienes turnos disponibles para reseñar en este establecimiento</p>
          <p className="no-turnos-subtitle">
            Solo puedes dejar reseñas para turnos que ya hayan pasado
          </p>
          {onCancel && (
            <button onClick={onCancel} className="btn-secondary">
              Cerrar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="crear-resenia-container">
      <h3>Dejar una reseña</h3>
      
      <form onSubmit={handleSubmit} className="form-resenia">
        {/* Selector de turno (si hay más de uno) */}
        {turnos.length > 1 && (
          <div className="form-group">
            <label htmlFor="turno">Selecciona el turno a reseñar:</label>
            <select
              id="turno"
              value={turnoSeleccionado || ''}
              onChange={(e) => setTurnoSeleccionado(Number(e.target.value))}
              required
              className="form-select"
            >
              <option value="">-- Seleccionar turno --</option>
              {turnos.map((turno) => (
                <option key={turno.id} value={turno.id}>
                  {formatearFecha(turno.fecha)} - {turno.hora || 'Sin hora'}
                  {turno.profesionalNombre && ` - ${turno.profesionalNombre}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Información del turno si solo hay uno */}
        {turnos.length === 1 && (
          <div className="turno-info">
            <strong>Turno:</strong> {formatearFecha(turnos[0].fecha)}
            {turnos[0].hora && ` - ${turnos[0].hora}`}
            {turnos[0].profesionalNombre && (
              <div className="profesional-info">
                Con: {turnos[0].profesionalNombre}
              </div>
            )}
          </div>
        )}

        {/* Selector de puntuación */}
        <div className="form-group">
          <label>Puntuación:</label>
          <SelectorEstrellas puntuacion={puntuacion} onChange={setPuntuacion} />
        </div>

        {/* Campo de comentario */}
        <div className="form-group">
          <label htmlFor="comentario">Tu opinión:</label>
          <textarea
            id="comentario"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Comparte tu experiencia con este establecimiento..."
            rows={5}
            maxLength={1000}
            required
            className="form-textarea"
          />
          <div className="caracteres-contador">
            {comentario.length} / 1000 caracteres
          </div>
        </div>

        {/* Mensajes de error */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Botones de acción */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? 'Publicando...' : 'Publicar reseña'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="btn-secondary"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
