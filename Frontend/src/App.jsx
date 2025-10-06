// INICIO CAMBIO - Archivo: src/App.jsx - Ejemplo de implementación
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MapComponent from './components/Map.jsx';
import Turnos from './components/turnos/Turnos.jsx';
import InsuranceSection from './components/CardsSegure/InsuranceSection.jsx';
import LanguageSelector from './components/LanguageSelector.jsx';
import ModalAuth from './components/Auth/ModalAuth.jsx';
import { AuthProvider, useAuth } from './components/Auth/AuthContext';
import locationService from './services/locationService.js';
import { cleanOldTiles } from './services/db.js';

function App() {
	const { t } = useTranslation();
	const { user, logout } = useAuth();
	const [isLoading, setIsLoading] = useState(true);
	const [currentLocation, setCurrentLocation] = useState(null);
	const [activeTab, setActiveTab] = useState('mapa');
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [showRegister, setShowRegister] = useState(false);

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

		// Escuchar evento de cambio de tab desde otros componentes
		const handleChangeTab = (e) => {
			if (e.detail?.tab) {
				setActiveTab(e.detail.tab);
			}
		};

		window.addEventListener('saludmap:change-tab', handleChangeTab);

		return () => {
			unsubscribe();
			window.removeEventListener('saludmap:change-tab', handleChangeTab);
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
        <div>{t('common.loading')}</div>
        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          {t('common.allowLocation')}
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
		<AuthProvider>
			<div className="app">
				<header>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
						<h1>{t('common.appName')}</h1>
						<div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
							<LanguageSelector />
							{user ? (
								<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
									<span style={{ color: '#47472e', fontWeight: 'bold' }}>
										👤 {user.nombre} {user.apellido}
									</span>
									<button
										onClick={logout}
										style={{
											padding: '8px 16px',
											border: 'none',
											borderRadius: '6px',
											backgroundColor: '#ff6b6b',
											color: '#fff',
											cursor: 'pointer',
											fontSize: '0.9rem',
											fontWeight: 'bold',
											transition: 'all 0.3s ease'
										}}
									>
										Cerrar Sesión
									</button>
								</div>
							) : (
								<button
									onClick={() => {
										setShowRegister(false);
										setShowAuthModal(true);
									}}
									style={{
										padding: '8px 16px',
										border: 'none',
										borderRadius: '6px',
										backgroundColor: '#47472e',
										color: '#fff',
										cursor: 'pointer',
										fontSize: '0.9rem',
										fontWeight: 'bold',
										transition: 'all 0.3s ease'
									}}
								>
									Iniciar Sesión
								</button>
							)}
						</div>
					</div>
        
        {/* Navigation Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          textAlign:'center',
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
            🗺️ {t('nav.map')}
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
            📅 {t('nav.appointments')}
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
            🛡️ {t('nav.insurance')}
          </button>
        </nav>
      </header>
      
			<main style={{ minHeight: 'calc(100vh - 200px)' }}>
				{renderActiveSection()}
			</main>
			<footer>
				<p>{t('footer.copyright')}</p>
			</footer>

			{/* Modal de Autenticación */}
			<ModalAuth
				open={showAuthModal}
				onClose={() => setShowAuthModal(false)}
				showRegister={showRegister}
				setShowRegister={setShowRegister}
			/>
		</div>
		</AuthProvider>
	);
}

export default App;
