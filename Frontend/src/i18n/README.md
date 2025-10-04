# Sistema de Internacionalización (i18n) - SaludMap

## 📋 Descripción
Sistema multiidioma implementado con **react-i18next** que soporta 3 idiomas:
- 🇪🇸 **Español** (por defecto)
- 🇬🇧 **Inglés**
- 🇫🇷 **Francés**

## 🚀 Uso en Componentes

### 1. Importar el hook useTranslation
```javascript
import { useTranslation } from 'react-i18next';
```

### 2. Usar el hook en tu componente
```javascript
function MiComponente() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <p>{t('map.searchPlaceholder')}</p>
    </div>
  );
}
```

### 3. Acceder a traducciones anidadas
Las traducciones están organizadas por categorías. Usa la notación de punto:

```javascript
{t('nav.map')}           // "Mapa" / "Map" / "Carte"
{t('common.loading')}    // "Cargando..." / "Loading..." / "Chargement..."
{t('appointments.date')} // "Fecha" / "Date" / "Date"
```

## 📁 Estructura de Archivos

```
src/i18n/
├── config.js           # Configuración de i18next
├── locales/
│   ├── es.json        # Traducciones en español
│   ├── en.json        # Traducciones en inglés
│   └── fr.json        # Traducciones en francés
└── README.md          # Esta guía
```

## 🔑 Categorías de Traducciones

### common
Textos comunes de la aplicación
- `appName`, `loading`, `allowLocation`, etc.

### nav
Elementos de navegación
- `map`, `appointments`, `insurance`

### map
Textos del componente de mapa
- `title`, `myLocation`, `saveLocation`, `calibrateGPS`, etc.

### appointments
Textos de gestión de turnos
- `title`, `date`, `time`, `doctor`, `status`, etc.

### insurance
Textos de seguros médicos
- `title`, `coverage`, `plan`, `benefits`, etc.

### footer
Textos del pie de página
- `copyright`

## ➕ Agregar Nuevas Traducciones

1. Abre los archivos en `src/i18n/locales/`
2. Agrega la nueva clave en los 3 idiomas (es.json, en.json, fr.json)
3. Usa la clave en tu componente con `t('categoria.clave')`

**Ejemplo:**
```json
// es.json
{
  "map": {
    "newFeature": "Nueva Funcionalidad"
  }
}

// en.json
{
  "map": {
    "newFeature": "New Feature"
  }
}

// fr.json
{
  "map": {
    "newFeature": "Nouvelle Fonctionnalité"
  }
}
```

## 🎨 Selector de Idioma

El componente `<LanguageSelector />` está integrado en el navbar de la aplicación.
- Muestra el idioma actual con bandera
- Permite cambiar entre los 3 idiomas disponibles
- Guarda la preferencia en localStorage

## 🔄 Cambiar Idioma Programáticamente

```javascript
import { useTranslation } from 'react-i18next';

function MiComponente() {
  const { i18n } = useTranslation();
  
  const cambiarIdioma = (codigo) => {
    i18n.changeLanguage(codigo); // 'es', 'en', o 'fr'
    localStorage.setItem('language', codigo);
  };
  
  return (
    <button onClick={() => cambiarIdioma('en')}>
      Cambiar a Inglés
    </button>
  );
}
```

## 📝 Ejemplo Completo

```javascript
import React from 'react';
import { useTranslation } from 'react-i18next';

function EjemploComponente() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <p>{t('map.searchPlaceholder')}</p>
      <button onClick={() => i18n.changeLanguage('en')}>
        English
      </button>
      <button onClick={() => i18n.changeLanguage('es')}>
        Español
      </button>
      <button onClick={() => i18n.changeLanguage('fr')}>
        Français
      </button>
    </div>
  );
}

export default EjemploComponente;
```

## 🌐 Idioma por Defecto

El sistema detecta automáticamente el idioma del navegador, pero siempre usa **español** como fallback.
La preferencia del usuario se guarda en `localStorage` con la clave `'language'`.

## ⚙️ Configuración Avanzada

Ver `src/i18n/config.js` para modificar:
- Idioma por defecto
- Detección automática de idioma
- Opciones de interpolación
- Modo debug
