import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';
import IconEspanol from '../assets/Icon_Spañol.png';
import IconFrance from '../assets/Icon_france.png';
import IconGB from '../assets/Icon_reinoUnido.png';
import IconTema from '../assets/Icon_tema.png';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'claro');

  const languages = [
    { code: 'es', name: 'Español', img: IconEspanol },
    { code: 'en', name: 'English', img: IconGB },
    { code: 'fr', name: 'Français', img: IconFrance }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
    setIsOpen(false);
  };

  useEffect(() => {
    // apply theme class to document body (add or remove only .dark-theme as requested)
    const body = document.body;
    if (theme === 'oscuro') body.classList.add('dark-theme');
    else body.classList.remove('dark-theme');
  }, [theme]);

  const selectTheme = (t) => {
    setTheme(t);
    localStorage.setItem('theme', t);
    setThemeOpen(false);
  };

  return (

    <div className="language-selector">
      {/* Theme button placed to the left of language selector */}
      <div className="theme-wrapper">
        <button
          className={`language-button nav-button theme-button ${theme === 'claro' ? 'active' : ''}`}
          onClick={() => setThemeOpen(!themeOpen)}
          aria-label="Seleccionar tema"
        >
          <img src={IconTema} alt="tema" className="theme-icon" />
        </button>

        {themeOpen && (
          <div className="theme-dropdown">
            <button className={`theme-option ${theme === 'claro' ? 'active' : ''}`} onClick={() => selectTheme('claro')}>Tema Claro</button>
            <button className={`theme-option ${theme === 'oscuro' ? 'active' : ''}`} onClick={() => selectTheme('oscuro')}>Tema Oscuro</button>
          </div>
        )}
      </div>

      <button 
        className={`language-button nav-button ${i18n.language === currentLanguage.code ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Seleccionar idioma"
      >
        <img src={currentLanguage.img} alt={currentLanguage.code} className="lang-flag-img" />
        <span className="lang-code">{currentLanguage.code.toUpperCase()}</span>
        <span className="arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="language-dropdown">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`language-option nav-button ${i18n.language === lang.code ? 'active' : ''}`}
              onClick={() => changeLanguage(lang.code)}
            >
              <img src={lang.img} alt={lang.code} className="lang-flag-img" />
              <span className="lang-code">{lang.code.toUpperCase()}</span>
              <span className="lang-name">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
