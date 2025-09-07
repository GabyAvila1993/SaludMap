import React, { useState } from 'react';
import './SaveLocationModal.css';

export default function SaveLocationModal({ isOpen, onClose, onSave, currentLocation }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name.trim()) {
            setError('El nombre es obligatorio');
            return;
        }

        if (!currentLocation) {
            setError('No hay ubicación actual disponible');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await onSave({
                name: name.trim(),
                description: description.trim(),
                lat: currentLocation.lat,
                lng: currentLocation.lng
            });
            
            // Limpiar formulario y cerrar modal
            setName('');
            setDescription('');
            onClose();
        } catch (err) {
            setError(err.message || 'Error al guardar la ubicación');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setName('');
        setDescription('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Guardar Ubicación</h3>
                    <button className="modal-close" onClick={handleClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="location-name">Nombre de la ubicación *</label>
                        <input
                            id="location-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Casa, Trabajo, Hospital Central..."
                            maxLength={50}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="location-description">Descripción (opcional)</label>
                        <textarea
                            id="location-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Agrega una descripción o notas adicionales..."
                            maxLength={200}
                            rows={3}
                            disabled={isLoading}
                        />
                    </div>

                    {currentLocation && (
                        <div className="location-info">
                            <strong>Coordenadas:</strong>
                            <div className="coordinates">
                                Lat: {currentLocation.lat.toFixed(6)}, 
                                Lng: {currentLocation.lng.toFixed(6)}
                            </div>
                            {currentLocation.accuracy && (
                                <div className="accuracy">
                                    Precisión: ~{Math.round(currentLocation.accuracy)}m
                                </div>
                            )}
                        </div>
                    )}

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-actions">
                        <button 
                            type="button" 
                            onClick={handleClose}
                            disabled={isLoading}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={isLoading || !name.trim()}
                            className="btn-primary"
                        >
                            {isLoading ? 'Guardando...' : 'Guardar Ubicación'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
