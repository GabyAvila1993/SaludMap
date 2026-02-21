import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route } from 'react-router-dom';
import MapComponent from './components/Map.jsx';
import Turnos from './components/turnos/Turnos.jsx';
import InsuranceSection from './components/CardsSegure/InsuranceSection.jsx';
import LanguageSelector from './components/LanguageSelector.jsx';
import ModalAuth from './components/Auth/ModalAuth.jsx';
import ChatBot from './components/ChatBot/ChatBot.jsx';
import { useAuth } from './components/Auth/AuthContext';
import locationService from './services/locationService.js';
import { cleanOldTiles } from './services/db.js';
import Analytics from './components/Analytics/Analytics';
import './App.css';
import LogoImg from './assets/Logo_saludmap_sinfondo.png';
import IconPerson from './assets/Icono_persona.png';


function App() {
	const { t } = useTranslation();
	const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleDocClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      // close mobile menu if clicking outside nav
      if (!e.target.closest || !e.target.closest('.app-nav')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, []);
	const [isLoading, setIsLoading] = useState(true);
	const [, setCurrentLocation] = useState(null);
	const [activeTab, setActiveTab] = useState('mapa');
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [showRegister, setShowRegister] = useState(false);
	const [selectedEstablishment, setSelectedEstablishment] = useState(null);

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
      <div className="loading-screen">
        <div>{t('common.loading')}</div>
        <div className="loading-subtitle">{t('common.allowLocation')}</div>
      </div>
    );
  }

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'mapa':
        return <MapComponent onEstablishmentSelect={setSelectedEstablishment} />;
      case 'analytics':
        return selectedEstablishment ? 
          <Analytics establishmentId={selectedEstablishment.id} /> : 
          <div>Por favor seleccione un establecimiento en el mapa</div>;
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
      <ChatBot />
        <header className="site-header">
          <nav className="app-nav">
            <div className="nav-left">
              <div className="logo">
                <img src={LogoImg} alt="SaludMap" className="logo-img" />
                <span className="logo-text">{t('common.appName')}</span>
              </div>
            </div>

            <div className="nav-center">
              <div className="nav-buttons">
                <button onClick={() => { setActiveTab('mapa'); setShowMobileMenu(false); }} className={`nav-button ${activeTab === 'mapa' ? 'active' : ''}`}>Mapa</button>
                <button onClick={() => { setActiveTab('turnos'); setShowMobileMenu(false); }} className={`nav-button ${activeTab === 'turnos' ? 'active' : ''}`}>Turnos</button>
                <button onClick={() => { setActiveTab('seguros'); setShowMobileMenu(false); }} className={`nav-button ${activeTab === 'seguros' ? 'active' : ''}`}>Seguros</button>
              </div>
              <button className="hamburger" onClick={(e) => { e.stopPropagation(); setShowMobileMenu(m => !m); }} aria-label="Menú">☰</button>

              {showMobileMenu && (
                <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => { setActiveTab('mapa'); setShowMobileMenu(false); }} className={`nav-button ${activeTab === 'mapa' ? 'active' : ''}`}>Mapa</button>
                  <button onClick={() => { setActiveTab('turnos'); setShowMobileMenu(false); }} className={`nav-button ${activeTab === 'turnos' ? 'active' : ''}`}>Turnos</button>
                  <button onClick={() => { setActiveTab('seguros'); setShowMobileMenu(false); }} className={`nav-button ${activeTab === 'seguros' ? 'active' : ''}`}>Seguros</button>
                </div>
              )}
            </div>

            <div className="nav-right">
              <div className="user-controls">
                <LanguageSelector />
                <span className="nav-username">{user ? `${user.nombre} ${user.apellido}` : 'nuevo usuario'}</span>

                <div className={`user-menu ${showUserMenu ? 'open' : ''}`} ref={userMenuRef}>
                  <button className="profile-avatar" onClick={(e) => { e.stopPropagation(); setShowUserMenu(s => !s); }} aria-haspopup="true" aria-expanded={showUserMenu}>
                    <img src={IconPerson} alt="perfil" className="nav-person-icon" />
                  </button>
                  <div className="user-dropdown" role="menu">
                    {user ? (
                      <button className="btn-logout" onClick={() => { logout(); setShowUserMenu(false); }}>Cerrar Sesión</button>
                    ) : (
                      <button className="btn-login" onClick={() => { setShowAuthModal(true); setShowUserMenu(false); }}>Iniciar Sesión</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </header>

      <main className="app-main">{renderActiveSection()}</main>

      <footer className="app-footer"><p>{t('footer.copyright')}</p></footer>

      <ModalAuth open={showAuthModal} onClose={() => setShowAuthModal(false)} showRegister={showRegister} setShowRegister={setShowRegister} />
    </div>
  );
}

export default App;
