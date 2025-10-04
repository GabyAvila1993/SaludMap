# 🚀 Guía Rápida - Sistema Multiidioma

## ✅ ¿Qué se implementó?

Tu aplicación SaludMap ahora soporta **3 idiomas**:
- 🇪🇸 Español (por defecto)
- 🇬🇧 Inglés  
- 🇫🇷 Francés

## 📍 ¿Dónde está el selector de idioma?

El selector está ubicado en la **esquina superior derecha** del navbar, al lado del título "SaludMap".

```
┌─────────────────────────────────────────────┐
│  SaludMap                    [🇪🇸 ES ▼]    │
│                                             │
│  [🗺️ Mapa] [📅 Turnos] [🛡️ Seguros]       │
└─────────────────────────────────────────────┘
```

Al hacer clic se despliega:
```
┌─────────────────┐
│ 🇪🇸 Español     │ ← Activo
│ 🇬🇧 English     │
│ 🇫🇷 Français    │
└─────────────────┘
```

## 🎯 Componentes Ya Traducidos

### ✅ App.jsx
- Título de la app
- Navegación (Mapa, Turnos, Seguros)
- Mensajes de carga
- Footer

### ✅ SaveLocationModal.jsx
- Título del modal
- Labels de formulario
- Botones (Guardar, Cancelar)
- Mensajes de error

### ✅ SavedLocationsList.jsx
- Título de ubicaciones guardadas
- Estados (cargando, vacío)
- Botones de acción
- Mensajes de confirmación

## 🔧 Cómo Traducir Otros Componentes

### Ejemplo: Traducir un botón en Map.jsx

**ANTES:**
```javascript
<button>Calibrar GPS</button>
```

**DESPUÉS:**
```javascript
import { useTranslation } from 'react-i18next';

function MapComponent() {
  const { t } = useTranslation();
  
  return <button>{t('map.calibrateGPS')}</button>;
}
```

**Resultado:**
- 🇪🇸 "Calibrar GPS"
- 🇬🇧 "Calibrate GPS"
- 🇫🇷 "Calibrer GPS"

## 📝 Traducciones Disponibles

### Para el Mapa (map.*)
```javascript
t('map.saveLocation')      // Guardar Ubicación
t('map.viewLocations')     // Ver Ubicaciones
t('map.calibrateGPS')      // Calibrar GPS
t('map.downloadArea')      // Descargar Área
t('map.accuracy')          // Precisión
t('map.meters')            // metros
t('map.searching')         // Buscando...
t('map.noResults')         // No se encontraron resultados
```

### Para Turnos (appointments.*)
```javascript
t('appointments.title')         // Gestión de Turnos
t('appointments.myAppointments') // Mis Turnos
t('appointments.newAppointment') // Nuevo Turno
t('appointments.date')          // Fecha
t('appointments.time')          // Hora
t('appointments.doctor')        // Médico
```

### Para Seguros (insurance.*)
```javascript
t('insurance.title')       // Seguros Médicos
t('insurance.coverage')    // Cobertura
t('insurance.plan')        // Plan
t('insurance.benefits')    // Beneficios
```

## ➕ Agregar Nueva Traducción

1. **Abre los 3 archivos JSON** en `src/i18n/locales/`

2. **Agrega la misma clave en los 3 idiomas:**

**es.json**
```json
{
  "map": {
    "newButton": "Mi Nuevo Botón"
  }
}
```

**en.json**
```json
{
  "map": {
    "newButton": "My New Button"
  }
}
```

**fr.json**
```json
{
  "map": {
    "newButton": "Mon Nouveau Bouton"
  }
}
```

3. **Úsala en tu componente:**
```javascript
<button>{t('map.newButton')}</button>
```

## 🔄 Cambiar Idioma por Código

```javascript
import { useTranslation } from 'react-i18next';

function MiComponente() {
  const { i18n } = useTranslation();
  
  // Cambiar a inglés
  i18n.changeLanguage('en');
  
  // Cambiar a francés
  i18n.changeLanguage('fr');
  
  // Cambiar a español
  i18n.changeLanguage('es');
}
```

## 📱 Comportamiento

### Al Cargar la App:
1. Busca idioma guardado en localStorage
2. Si no hay, detecta idioma del navegador
3. Si no puede detectar, usa español por defecto

### Al Cambiar Idioma:
1. Actualiza toda la interfaz instantáneamente
2. Guarda la preferencia en localStorage
3. Persiste entre sesiones

## 🎨 Personalizar Selector

El selector está en: `src/components/LanguageSelector.jsx`

Puedes modificar:
- Banderas (emojis o imágenes)
- Estilos (colores, tamaño)
- Posición (cambiar en App.jsx)
- Idiomas disponibles (agregar/quitar)

## 📚 Documentación Completa

- **Guía Detallada**: `src/i18n/README.md`
- **Ejemplos Map.jsx**: `src/i18n/EJEMPLO_USO_MAP.md`
- **Implementación**: `IMPLEMENTACION_I18N.md`

## ✨ Tips

1. **Siempre usa `t()` para textos visibles** al usuario
2. **Mantén las claves organizadas** por categoría
3. **Traduce mensajes de error** para mejor UX
4. **Prueba en los 3 idiomas** antes de publicar

## 🐛 Solución de Problemas

### El texto no cambia
- Verifica que la clave existe en los 3 archivos JSON
- Asegúrate de usar `const { t } = useTranslation()`

### Error "t is not a function"
- Importa el hook: `import { useTranslation } from 'react-i18next'`
- Úsalo dentro del componente: `const { t } = useTranslation()`

### Idioma no persiste
- El sistema guarda en localStorage automáticamente
- Verifica que el navegador permita localStorage

---

**¡Listo!** Tu app ahora es multiidioma 🌐
