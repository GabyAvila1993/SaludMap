# Ejemplo de Uso de Traducciones en Map.jsx

## 📝 Cómo adaptar el componente Map

Para usar las traducciones en el componente Map.jsx, sigue estos pasos:

### 1. Importar el hook
```javascript
import { useTranslation } from 'react-i18next';
```

### 2. Usar el hook dentro del componente
```javascript
export default function MapComponent() {
    const { t } = useTranslation(); // Agregar esta línea
    
    // ... resto del código
}
```

### 3. Reemplazar textos estáticos

#### Antes:
```javascript
<button>Guardar Ubicación</button>
<button>Ver Ubicaciones</button>
<button>Calibrar GPS</button>
<button>Descargar Área</button>
```

#### Después:
```javascript
<button>{t('map.saveLocation')}</button>
<button>{t('map.viewLocations')}</button>
<button>{t('map.calibrateGPS')}</button>
<button>{t('map.downloadArea')}</button>
```

### 4. Textos de precisión GPS

#### Antes:
```javascript
<div>Precisión: {accuracy} metros</div>
```

#### Después:
```javascript
<div>{t('map.accuracy')}: {accuracy} {t('map.meters')}</div>
```

### 5. Placeholder de búsqueda

#### Antes:
```javascript
<input placeholder="Buscar servicios de salud..." />
```

#### Después:
```javascript
<input placeholder={t('map.searchPlaceholder')} />
```

### 6. Estados de carga

#### Antes:
```javascript
{isSearching && <div>Buscando...</div>}
{lugares.length === 0 && <div>No se encontraron resultados</div>}
```

#### Después:
```javascript
{isSearching && <div>{t('map.searching')}</div>}
{lugares.length === 0 && <div>{t('map.noResults')}</div>}
```

## 🎯 Traducciones Disponibles para Map

```javascript
t('map.title')                  // "Mapa de Servicios de Salud"
t('map.myLocation')             // "Mi Ubicación"
t('map.searchPlaceholder')      // "Buscar servicios de salud..."
t('map.saveLocation')           // "Guardar Ubicación"
t('map.viewLocations')          // "Ver Ubicaciones"
t('map.calibrateGPS')           // "Calibrar GPS"
t('map.downloadArea')           // "Descargar Área"
t('map.accuracy')               // "Precisión"
t('map.meters')                 // "metros"
t('map.searching')              // "Buscando..."
t('map.noResults')              // "No se encontraron resultados"
t('map.savedLocations')         // "Ubicaciones Guardadas"
t('map.close')                  // "Cerrar"
t('map.goToLocation')           // "Ir a Ubicación"
t('map.delete')                 // "Eliminar"
t('map.saveLocationTitle')      // "Guardar Ubicación"
t('map.locationName')           // "Nombre de la ubicación"
t('map.locationNamePlaceholder')// "Ej: Hospital Central"
t('map.save')                   // "Guardar"
t('map.cancel')                 // "Cancelar"
```

## 📋 Ejemplo Completo de Botones

```javascript
export default function MapComponent() {
    const { t } = useTranslation();
    
    // ... código existente ...
    
    return (
        <div className="map-container">
            <div className="map-controls">
                <button 
                    className="control-button"
                    onClick={() => setShowSaveLocationModal(true)}
                >
                    📍 {t('map.saveLocation')}
                </button>
                
                <button 
                    className="control-button"
                    onClick={() => setShowSavedLocationsList(true)}
                >
                    📋 {t('map.viewLocations')}
                </button>
                
                <button 
                    className="control-button"
                    onClick={handleCalibrateGPS}
                    disabled={isCalibrating}
                >
                    🎯 {t('map.calibrateGPS')}
                </button>
                
                <button 
                    className="control-button"
                    onClick={handleDownloadArea}
                >
                    💾 {t('map.downloadArea')}
                </button>
            </div>
            
            {/* Indicador de precisión */}
            {currentLocation && (
                <div className="accuracy-indicator">
                    {t('map.accuracy')}: {currentLocation.accuracy.toFixed(0)} {t('map.meters')}
                </div>
            )}
            
            {/* Resto del componente */}
        </div>
    );
}
```

## 🔄 Modales y Componentes Hijos

Los componentes hijos también pueden usar traducciones:

### SaveLocationModal.jsx
```javascript
import { useTranslation } from 'react-i18next';

function SaveLocationModal({ isOpen, onClose, onSave }) {
    const { t } = useTranslation();
    
    return (
        <div className="modal">
            <h2>{t('map.saveLocationTitle')}</h2>
            <input 
                placeholder={t('map.locationNamePlaceholder')}
            />
            <button onClick={onSave}>{t('map.save')}</button>
            <button onClick={onClose}>{t('map.cancel')}</button>
        </div>
    );
}
```

### SavedLocationsList.jsx
```javascript
import { useTranslation } from 'react-i18next';

function SavedLocationsList({ locations, onClose, onGoTo }) {
    const { t } = useTranslation();
    
    return (
        <div className="locations-list">
            <h2>{t('map.savedLocations')}</h2>
            {locations.map(loc => (
                <div key={loc.id}>
                    <span>{loc.name}</span>
                    <button onClick={() => onGoTo(loc)}>
                        {t('map.goToLocation')}
                    </button>
                    <button onClick={() => onDelete(loc)}>
                        {t('map.delete')}
                    </button>
                </div>
            ))}
            <button onClick={onClose}>{t('map.close')}</button>
        </div>
    );
}
```
