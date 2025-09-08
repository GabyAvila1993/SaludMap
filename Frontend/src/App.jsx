// INICIO CAMBIO - Archivo: src/App.jsx - Ejemplo de implementación
import React, { useEffect, useState } from 'react';
import MapComponent from './components/Map.jsx';
import Turnos from './components/turnos/Turnos.jsx';
import InsuranceSection from './components/CardsSegure/InsuranceSection.jsx';
import locationService from './services/locationService.js';
import { cleanOldTiles } from './services/db.js';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('mapa');

  useEffect(() => {
    // Limpiar tiles antiguos al iniciar la app
    cleanOldTiles().catch(console.error);

    // Suscribirse a cambios de ubicación para la UI general
    const unsubscribe = locationService.subscribe((location) => {
      setCurrentLocation(location);
      setIsLoading(false);
    });

    // Intentar cargar última ubicación conocida
    locationService.loadLastKnownLocation().then((lastLocation) => {
      if (!lastLocation) {
        // Si no hay ubicación guardada, obtener ubicación actual
        locationService.getCurrentPosition().catch((error) => {
          console.error('Error obteniendo ubicación inicial:', error);
          setIsLoading(false);
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div>Cargando ubicación...</div>
        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          Por favor, permite el acceso a tu ubicación
        </div>
      </div>
    );
  }

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'mapa':
        return <MapComponent />;
      case 'turnos':
        return <Turnos />;
      case 'seguros':
        return <InsuranceSection />;
      default:
        return <MapComponent />;
    }
  };

  return (
    <div className="app">
      <header>
        <h1>SaludMap</h1>
        
        {/* Navigation Tabs */}
        <nav style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '20px',
          padding: '0 20px'
        }}>
          <button
            onClick={() => setActiveTab('mapa')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: activeTab === 'mapa' ? '#47472e' : '#f0f0f0',
              color: activeTab === 'mapa' ? '#fff' : '#47472e',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: activeTab === 'mapa' ? 'bold' : 'normal',
              boxShadow: activeTab === 'mapa' ? '0 2px 4px rgba(255, 224, 166, 0.3)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            🗺️ Mapa
          </button>
          
          <button
            onClick={() => setActiveTab('turnos')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: activeTab === 'turnos' ? '#47472e' : '#f0f0f0',
              color: activeTab === 'turnos' ? '#fff' : '#47472e',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: activeTab === 'turnos' ? 'bold' : 'normal',
              boxShadow: activeTab === 'turnos' ? '0 2px 4px rgba(255, 224, 166, 0.3)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            📅 Turnos
          </button>
          
          <button
            onClick={() => setActiveTab('seguros')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: activeTab === 'seguros' ? '#47472e' : '#f0f0f0',
              color: activeTab === 'seguros' ? '#fff' : '#47472e',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: activeTab === 'seguros' ? 'bold' : 'normal',
              boxShadow: activeTab === 'seguros' ? '0 2px 4px rgba(255, 224, 166, 0.3)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            🛡️ Seguros
          </button>
        </nav>
      </header>
      
      <main style={{ minHeight: 'calc(100vh - 200px)' }}>
        {renderActiveSection()}
      </main>
      
      <footer>
        <p>&copy; 2024 SaludMap - Encuentra servicios de salud cercanos</p>
      </footer>
    </div>
  );
}

export default App;
// FIN CAMBIO - Archivo: src/App.jsx