import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getSavedLocations, deleteSavedLocation } from '../services/db.js';
import locationService from '../services/locationService.js';
import './SavedLocationsList.css';

export default function SavedLocationsList({ isOpen, onClose }) {
    const { t } = useTranslation();
    const [savedLocations, setSavedLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadSavedLocations();
        }
    }, [isOpen]);

    const loadSavedLocations = async () => {
        setIsLoading(true);
        setError('');
        try {
            const locations = await getSavedLocations();
            setSavedLocations(locations);
        } catch (err) {
            setError(t('map.errorLoading'));
            console.error('Error loading saved locations:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoToLocation = async (location) => {
        try {
            await locationService.setManualLocation(location.lat, location.lng);
            // Emitir evento para que el mapa se centre
            window.dispatchEvent(new CustomEvent('centerMapOnLocation', {
                detail: { lat: location.lat, lng: location.lng }
            }));
            onClose();
        } catch (err) {
            setError(t('map.errorGoingTo'));
            console.error('Error going to location:', err);
        }
    };

    const handleDeleteLocation = async (locationId, locationName) => {
        if (!confirm(`${t('map.confirmDelete')} "${locationName}"?`)) {
            return;
        }

        try {
            await deleteSavedLocation(locationId);
            setSavedLocations(prev => prev.filter(loc => loc.id !== locationId));
        } catch (err) {
            setError(t('map.errorDeleting'));
            console.error('Error deleting location:', err);
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content locations-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{t('map.savedLocations')}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="locations-content">
                    {error && <div className="error-message">{error}</div>}

                    {isLoading ? (
                        <div className="loading-message">{t('map.loadingLocations')}</div>
                    ) : savedLocations.length === 0 ? (
                        <div className="empty-message">
                            <div className="empty-icon">📍</div>
                            <p>{t('map.noSavedLocations')}</p>
                            <p className="empty-subtitle">
                                {t('map.noSavedLocationsSubtitle')}
                            </p>
                        </div>
                    ) : (
                        <div className="locations-list">
                            {savedLocations.map((location) => (
                                <div key={location.id} className="location-item">
                                    <div className="location-main">
                                        <div className="location-header">
                                            <h4 className="location-name">{location.name}</h4>
                                            <div className="location-actions">
                                                <button
                                                    className="btn-go"
                                                    onClick={() => handleGoToLocation(location)}
                                                    title="Ir a esta ubicación"
                                                >
                                                    📍
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDeleteLocation(location.id, location.name)}
                                                    title="Eliminar ubicación"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>

                                        {location.description && (
                                            <p className="location-description">{location.description}</p>
                                        )}

                                        <div className="location-details">
                                            <div className="location-coords">
                                                <span className="coords-label">{t('map.coordinates')}:</span>
                                                <span className="coords-value">
                                                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                                                </span>
                                            </div>
                                            <div className="location-date">
                                                {t('map.savedOn')}: {formatDate(location.timestamp)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        {t('map.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
