// INICIO CAMBIO - Archivo: src/App.jsx - Ejemplo de implementación
import React, { useEffect, useState } from 'react';
import MapComponent from './components/Map.jsx';
import Turnos from './components/turnos/Turnos.jsx';
import locationService from './services/locationService.js';
import { cleanOldTiles } from './services/db.js';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);

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

  return (
    <div className="app">
      <header>
        <h1>SaludMap</h1>
      </header>
      
      <main>
        <MapComponent />
        <Turnos />
      </main>
      
      <footer>
        <p>&copy; 2024 SaludMap - Encuentra servicios de salud cercanos</p>
      </footer>
    </div>
  );
}

export default App;
// FIN CAMBIO - Archivo: src/App.jsx