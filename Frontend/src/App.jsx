import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import MapComponent from './components/Map.jsx';
import Turnos from './components/turnos/Turnos.jsx';
import InsuranceSection from './components/CardsSegure/InsuranceSection.jsx';
import LanguageSelector from './components/LanguageSelector.jsx';
import ModalAuth from './components/Auth/ModalAuth.jsx';
import { ChatbotWidget } from "./components/ChatbotWidget.jsx";
import { useAuth } from './components/Auth/AuthContext';
import locationService from './services/locationService.js';
import { cleanOldTiles } from './services/db.js';
import Analytics from './components/Analytics/Analytics';
import { EmergencyWidget } from './components/EmergencyWidget.jsx';
import { startTutorial } from './utils/tutorial.js';
import './App.css';
import './styles/modal-light-overrides.css';
import LogoLight from './assets/logo-light.png';
import LogoDark from './assets/logo-dark.png';
import IconPerson from './assets/Icono_persona.png';

function App() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMapMenu, setShowMapMenu] = useState(false);
  
  // NUEVO: Estado para el menú de configuración (Tuerca)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  
  const mapMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const settingsMenuRef = useRef(null); // Ref para la tuerca

  // Lógica del Tema Oscuro
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isNowDark = document.body.classList.contains('dark-theme');
      if (isDarkMode !== isNowDark) {
        setIsDarkMode(isNowDark);
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [isDarkMode]);

  // Clics fuera de los menús
  useEffect(() => {
    const handleDocClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (mapMenuRef.current && !mapMenuRef.current.contains(e.target)) {
        setShowMapMenu(false);
      }
      // Cerrar menú de ajustes si hacemos clic afuera
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target)) {
        setShowSettingsMenu(false);
      }
      if (!e.target.closest || !e.target.closest('.app-nav')) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('mapa');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedEstablishment, setSelectedEstablishment] = useState(null);

  useEffect(() => {
    cleanOldTiles().catch(err => {
      toast.error('Error al limpiar archivos temporales de caché');
    });
    const unsubscribe = locationService.subscribe((location) => {
      setCurrentLocation(location);
      setIsLoading(false);
    });
    locationService.loadLastKnownLocation().then((lastLocation) => {
      if (!lastLocation) {
        locationService.getCurrentPosition().catch((error) => {
          toast.error('Error al obtener tu ubicación');
          setIsLoading(false);
        });
      }
    });
    const handleChangeTab = (e) => {
      if (e.detail?.tab) setActiveTab(e.detail.tab);
    };
    window.addEventListener('saludmap:change-tab', handleChangeTab);
    return () => {
      unsubscribe();
      window.removeEventListener('saludmap:change-tab', handleChangeTab);
    };
  }, []);

  const dispatchMapAction = (action) => {
    window.dispatchEvent(new CustomEvent('map-action', { detail: action }));
    setShowMapMenu(false);
    setShowMobileMenu(false);
  };

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
      case 'mapa':      return <MapComponent onEstablishmentSelect={setSelectedEstablishment} />;
      case 'analytics': return selectedEstablishment ? <Analytics establishmentId={selectedEstablishment.id} /> : <div>Seleccione un establecimiento</div>;
      case 'turnos':    return <Turnos />;
      case 'seguros':   return <InsuranceSection />;
      default:          return <MapComponent />;
    }
  };

  return (
    <div className="app">
      <ChatbotWidget />
      <EmergencyWidget />
      <header className="site-header">
        <nav className="app-nav">
          
          {/* ── IZQUIERDA: LOGO + SOS ── */}
          <div className="nav-left">
            <div className="logo">
              <img src={isDarkMode ? LogoDark : LogoLight} alt="SaludMap Logo" className="logo-img" />
              <span className="logo-text">
                <span className="logo-part-1">Salud</span>
                <span className="logo-part-2">Map</span>
              </span>
            </div>
            <EmergencyWidget />
          </div>

          {/* ── CENTRO: NAVEGACIÓN Y HAMBURGUESA ── */}
          <div className="nav-center">
            <div className="nav-buttons">
              {/* BOTÓN MAPA CON MENÚ DESPLEGABLE */}
              <div className="nav-item-dropdown" ref={mapMenuRef}>
                <button
                  onClick={() => {
                    if (activeTab !== 'mapa') setActiveTab('mapa');
                    setShowMapMenu(!showMapMenu);
                  }}
                  className={`nav-button ${activeTab === 'mapa' ? 'active' : ''}`}
                >
                  {t('nav.map', 'Mapa')}
                  {activeTab === 'mapa' && (
                    <span className={`dropdown-arrow ${showMapMenu ? 'open' : ''}`}>▼</span>
                  )}
                </button>
                {showMapMenu && activeTab === 'mapa' && (
                  <div className="navbar-dropdown-menu">
                    <button className="dropdown-menu-item" onClick={() => dispatchMapAction('calibrate')}>
                      <span className="dropdown-icon">📍</span> {t('map.updateLocation', 'Actualizar ubicación')}
                    </button>
                    {currentLocation?.source === 'manual' && (
                      <button className="dropdown-menu-item gps-item" onClick={() => dispatchMapAction('return-gps')}>
                        <span className="dropdown-icon">🛰️</span> {t('map.returnGPS', 'Volver a GPS')}
                      </button>
                    )}
                    <button className="dropdown-menu-item" onClick={() => dispatchMapAction('download-offline')}>
                      <span className="dropdown-icon">⬇️</span> {t('map.downloadOfflineArea', 'Descargar área offline')}
                    </button>
                    <button className="dropdown-menu-item" onClick={() => dispatchMapAction('save-location')}>
                      <span className="dropdown-icon">💾</span> {t('map.saveLocation', 'Guardar Ubicación')}
                    </button>
                    <button className="dropdown-menu-item" onClick={() => dispatchMapAction('view-locations')}>
                      <span className="dropdown-icon">📋</span> {t('map.viewLocations', 'Ver Ubicaciones')}
                    </button>
                    <button className="dropdown-menu-item" onClick={() => dispatchMapAction('filters')}>
                      <span className="dropdown-icon">🔍</span> {t('map.filters.title', 'Filtros')}
                    </button>
                  </div>
                )}
              </div>
              <button onClick={() => { setActiveTab('turnos'); setShowMapMenu(false); }} className={`nav-button ${activeTab === 'turnos' ? 'active' : ''}`}>
                {t('nav.appointments', 'Turnos')}
              </button>
              <button onClick={() => { setActiveTab('seguros'); setShowMapMenu(false); }} className={`nav-button ${activeTab === 'seguros' ? 'active' : ''}`}>
                {t('nav.insurance', 'Seguros')}
              </button>
              <button onClick={startTutorial} className="nav-button tutorial-btn" title={t('nav.tutorial', 'Iniciar tutorial')}>
                {t('nav.tutorial', 'Tutorial')}
              </button>
            </div>

            {/* BOTÓN HAMBURGUESA (MÓVIL) */}
            <button
              className="hamburger"
              onClick={(e) => { e.stopPropagation(); setShowMobileMenu(m => !m); }}
              aria-label="Menú"
              aria-expanded={showMobileMenu}
            >
              ☰
            </button>

            {/* MENÚ MÓVIL DESPLEGABLE */}
            {showMobileMenu && (
              <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
                <span className="mobile-menu-title">SaludMap</span>
                <button onClick={() => setActiveTab('mapa')} className={`nav-button ${activeTab === 'mapa' ? 'active' : ''}`} data-tour="nav-mapa">
                  {t('nav.map', 'Mapa')}
                </button>
                {activeTab === 'mapa' && (
                  <div className="mobile-submenu">
                    <button className="mobile-submenu-item" onClick={() => dispatchMapAction('calibrate')}>📍 Actualizar</button>
                    {currentLocation?.source === 'manual' && (
                      <button className="mobile-submenu-item gps-item" onClick={() => dispatchMapAction('return-gps')}>🛰️ Volver a GPS</button>
                    )}
                    <button className="mobile-submenu-item" onClick={() => dispatchMapAction('download-offline')}>⬇️ Descargar</button>
                    <button className="mobile-submenu-item" onClick={() => dispatchMapAction('save-location')}>💾 Guardar</button>
                    <button className="mobile-submenu-item" onClick={() => dispatchMapAction('view-locations')}>📋 Ver Ubicaciones</button>
                    <button className="mobile-submenu-item" onClick={() => dispatchMapAction('filters')}>🔍 Filtros</button>
                  </div>
                )}
                <button onClick={() => { setActiveTab('turnos'); setShowMobileMenu(false); }} className={`nav-button ${activeTab === 'turnos' ? 'active' : ''}`} data-tour="nav-turnos">
                  {t('nav.appointments', 'Turnos')}
                </button>
                <button onClick={() => { setActiveTab('seguros'); setShowMobileMenu(false); }} className={`nav-button ${activeTab === 'seguros' ? 'active' : ''}`} data-tour="nav-seguros">
                  {t('nav.insurance', 'Seguros')}
                </button>
                <button onClick={() => { startTutorial(); setShowMobileMenu(false); }} className="nav-button tutorial-btn" data-tour="nav-tutorial">
                  {t('nav.tutorial', 'Tutorial')}
                </button>
              </div>
            )}
          </div>

          {/* ── DERECHA: TEMA, IDIOMA Y AUTH/USUARIO ── */}
          <div className="nav-right">
            <div className="user-controls">
              
              {/* ── VERSIÓN PC (Botones sueltos) ── */}
              <div className="desktop-controls">
                <button
                  className="theme-toggle-btn"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                >
                  {isDarkMode ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5"></circle>
                      <line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                      <line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                  )}
                </button>
                <LanguageSelector />
              </div>

              {/* ── VERSIÓN MÓVIL (Tuerca que agrupa todo) ── */}
              <div className="settings-menu-container mobile-only-settings" ref={settingsMenuRef}>
                <button 
                  className="btn-nav-icon"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setShowSettingsMenu(s => !s); 
                    setShowUserMenu(false); 
                  }}
                  title="Configuración"
                >
                  ⚙️
                </button>
                
                <div className={`settings-dropdown ${showSettingsMenu ? 'open' : ''}`}>
                  <span className="settings-dropdown-title">Ajustes</span>
                  
                  {/* Contenedor de las opciones de ajuste */}
                  <div className="settings-dropdown-items">
                    
                    {/* Botón de Tema */}
                    <button
                      className="settings-item-row"
                      onClick={() => setIsDarkMode(!isDarkMode)}
                    >
                      <span className="settings-icon">{isDarkMode ? '☀️' : '🌙'}</span> 
                      <span className="settings-text">{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
                    </button>
                    
                    {/* Selector de Idioma */}
                    <div className="settings-item-row language-row">
                      {/* Estos span serán "fantasmas" visuales */}
                      <div className="language-row-content">
                        <span className="settings-icon">🌐</span>
                        <span className="settings-text">Idioma</span>
                      </div>
                      {/* Este control ocupará toda la fila invisiblemente */}
                      <div className="settings-lang-control">
                        <LanguageSelector />
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* ── USUARIO LOGUEADO O BOTONES DE LOGIN/REGISTRO ── */}
              {user ? (
                <div className="nav-user-inline">
                  <button
                    className="profile-avatar"
                    onClick={(e) => { e.stopPropagation(); setShowUserMenu(s => !s); setShowSettingsMenu(false); }}
                    aria-haspopup="true"
                    aria-expanded={showUserMenu}
                  >
                    <img src={user.avatar || IconPerson} alt="perfil" className="nav-person-icon" />
                  </button>
                  <span className="nav-username">{`${user.nombre} ${user.apellido}`}</span>
                  <div className={`user-menu ${showUserMenu ? 'open' : ''}`} ref={userMenuRef}>
                    <div className="user-dropdown" role="menu">
                      <button className="nav-button user-dropdown-logout" onClick={() => { logout(); setShowUserMenu(false); }}>
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="nav-auth-actions">
                  <button
                    className="btn-auth btn-login"
                    onClick={() => { setShowAuthModal(true); setShowRegister(false); }}
                  >
                    {t('auth.login', 'Ingresar')}
                  </button>
                  <button
                    className="btn-auth btn-register"
                    onClick={() => { setShowAuthModal(true); setShowRegister(true); }}
                  >
                    {t('auth.register', 'Registro')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>
      <main className="app-main">{renderActiveSection()}</main>
      <footer className="app-footer"><p>{t('footer.copyright')}</p></footer>
      <ModalAuth open={showAuthModal} onClose={() => setShowAuthModal(false)} showRegister={showRegister} setShowRegister={setShowRegister} />
      <Toaster position="top-center" richColors theme={isDarkMode ? 'dark' : 'light'} className="sonner-toaster" />
    </div>
  );
}

export default App;