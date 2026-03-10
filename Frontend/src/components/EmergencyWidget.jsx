import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './EmergencyWidget.css';

export const EmergencyWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  
  // En lugar de texto fijo, guardamos la "llave" (key) del JSON
  const [emergencyData, setEmergencyData] = useState({
    countryKey: 'country_international',
    ambulance: '112',
    police: '112'
  });

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    
    // Hacemos la detección más robusta para atrapar todas las provincias
    if (timeZone.includes('Argentina') || timeZone.includes('Buenos_Aires') || timeZone.includes('Mendoza') || timeZone.includes('Cordoba')) {
      setEmergencyData({ countryKey: 'country_argentina', ambulance: '107', police: '911' });
    } else if (timeZone.includes('Paris') || timeZone.includes('Europe/')) {
      setEmergencyData({ countryKey: 'country_france', ambulance: '15', police: '17' });
    } else if (timeZone.includes('America/')) {
      setEmergencyData({ countryKey: 'country_america', ambulance: '911', police: '911' });
    }
  }, []);

  return (
    <div className="emergency-nav-container">
      {/* Botón S.O.S expandido para el Navbar */}
      <button 
        className="btn-emergency-nav-sos" 
        onClick={() => setIsOpen(true)}
        title={t('emergency.title', 'Centro de Emergencia')}
      >
        <span className="emergency-icon-nav"></span>
        <span className="emergency-text-nav">{t('emergency.btn_sos', 'S.O.S.ss')}</span>
      </button>


      {/* Modal de Emergencia */}
      {isOpen && (
        <div className="emergency-overlay" onClick={() => setIsOpen(false)}>
          <div className="emergency-modal" onClick={(e) => e.stopPropagation()}>
            <div className="emergency-header">
              <h3>{t('emergency.title', 'Centro de Emergencia')}</h3>
              <button className="emergency-close" onClick={() => setIsOpen(false)}>✕</button>
            </div>
            
            <div className="emergency-body">
              {/* ¡Aquí aplicamos las traducciones! */}
              <div className="location-detector">
                📍 {t('emergency.location_detected')}: <strong>{t(`emergency.${emergencyData.countryKey}`)}</strong>
              </div>
              
              <p>{t('emergency.question', '¿Qué tipo de ayuda necesitas?')}</p>
              
              <a href={`tel:${emergencyData.ambulance}`} className="emergency-btn btn-red">
                <span className="btn-icon">🚑</span>
                <div>
                  <strong>{t('emergency.ambulance_desc', 'Ambulancia')} ({emergencyData.ambulance})</strong>
                </div>
              </a>

              <a href={`tel:${emergencyData.police}`} className="emergency-btn btn-dark">
                <span className="btn-icon">🚓</span>
                <div>
                  <strong>{t('emergency.police_desc', 'Policía')} ({emergencyData.police})</strong>
                </div>
              </a>

              <button 
                className="emergency-btn btn-outline"
                onClick={() => {
                  setIsOpen(false);
                  window.dispatchEvent(new CustomEvent('saludmap:change-tab', { detail: { tab: 'mapa' } }));
                }}
              >
                <span className="btn-icon">🏥</span>
                <div>
                  <strong>{t('emergency.find_hospital', 'Buscar Hospital')}</strong>
                  <span>{t('emergency.find_desc', 'Ver centros en el mapa')}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};