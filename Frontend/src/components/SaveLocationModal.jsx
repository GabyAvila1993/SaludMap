import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import './SaveLocationModal.css';

export default function SaveLocationModal({ isOpen, onClose, onSave, currentLocation }) {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name.trim()) {
            setError(t('map.locationNameRequired'));
            return;
        }

        if (!currentLocation) {
            setError(t('map.noLocationAvailable'));
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
            setError(err.message || t('map.errorSaving'));
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

    const modal = (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{t('map.saveLocationTitle')}</h3>
                    <button className="modal-close" onClick={handleClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="location-name">{t('map.locationName')} *</label>
                        <input
                            id="location-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('map.locationNamePlaceholder')}
                            maxLength={50}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="location-description">{t('map.description')}</label>
                        <textarea
                            id="location-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('map.descriptionPlaceholder')}
                            maxLength={200}
                            rows={3}
                            disabled={isLoading}
                        />
                    </div>

                    {currentLocation && (
                        <div className="location-info">
                            <strong>{t('map.coordinates')}:</strong>
                            <div className="coordinates">
                                Lat: {currentLocation.lat.toFixed(6)}, 
                                Lng: {currentLocation.lng.toFixed(6)}
                            </div>
                            {currentLocation.accuracy && (
                                <div className="accuracy">
                                    {t('map.accuracy')}: ~{Math.round(currentLocation.accuracy)}m
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
                            {t('map.cancel')}
                        </button>
                        <button 
                            type="submit" 
                            disabled={isLoading || !name.trim()}
                            className="btn-primary"
                        >
                            {isLoading ? t('map.saving') : t('map.saveLocation')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? ReactDOM.createPortal(modal, document.body) : null;
}
