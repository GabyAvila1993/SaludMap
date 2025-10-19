// INICIO CAMBIO - Archivo: src/services/db.js - Modificación completa para soporte offline
import { openDB } from 'idb';

const DB_NAME = 'saludmap-db';
const DB_VERSION = 3; // Incrementamos versión para nuevos stores
const PLACES_STORE = 'places';
const LOCATIONS_STORE = 'locations';
const TILES_STORE = 'tiles';
const SAVED_LOCATIONS_STORE = 'saved_locations';

export async function getDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Store para lugares/servicios
            if (!db.objectStoreNames.contains(PLACES_STORE)) {
                const placesStore = db.createObjectStore(PLACES_STORE, { keyPath: 'id', autoIncrement: true });
                placesStore.createIndex('lat', 'lat');
                placesStore.createIndex('lng', 'lng');
                placesStore.createIndex('type', 'type');
            }

            // Store para ubicaciones del usuario
            if (!db.objectStoreNames.contains(LOCATIONS_STORE)) {
                const locStore = db.createObjectStore(LOCATIONS_STORE, { keyPath: 'id', autoIncrement: true });
                locStore.createIndex('timestamp', 'timestamp');
                locStore.createIndex('source', 'source'); // gps, calibrated, manual
            }

            // Store para tiles de mapa offline
            if (!db.objectStoreNames.contains(TILES_STORE)) {
                const tilesStore = db.createObjectStore(TILES_STORE, { keyPath: 'url' });
                tilesStore.createIndex('z', 'z'); // zoom level
                tilesStore.createIndex('x', 'x');
                tilesStore.createIndex('y', 'y');
                tilesStore.createIndex('timestamp', 'timestamp');
            }

            // Store para ubicaciones guardadas con nombres personalizados
            if (!db.objectStoreNames.contains(SAVED_LOCATIONS_STORE)) {
                const savedLocStore = db.createObjectStore(SAVED_LOCATIONS_STORE, { keyPath: 'id', autoIncrement: true });
                savedLocStore.createIndex('name', 'name');
                savedLocStore.createIndex('timestamp', 'timestamp');
                savedLocStore.createIndex('lat', 'lat');
                savedLocStore.createIndex('lng', 'lng');
            }
        },
    });
}

// === LUGARES/SERVICIOS ===
export async function savePlaces(places) {
    const db = await getDB();
    const tx = db.transaction(PLACES_STORE, 'readwrite');
    for (const place of places) {
        // Agregar timestamp y normalizar datos
        const normalizedPlace = {
            ...place,
            lat: place.lat || place.center?.lat || place.geometry?.coordinates?.[1],
            lng: place.lng || place.lon || place.center?.lon || place.geometry?.coordinates?.[0],
            type: place.type || 'default',
            savedAt: Date.now()
        };
        await tx.store.put(normalizedPlace);
    }
    await tx.done;
}

export async function getNearbyPlaces(center, radius = 0.02) {
    const db = await getDB();
    const allPlaces = await db.getAll(PLACES_STORE);
    return allPlaces.filter((place) => {
        const dLat = Math.abs(place.lat - center.lat);
        const dLng = Math.abs(place.lng - center.lng);
        return dLat <= radius && dLng <= radius;
    });
}

// === UBICACIONES DEL USUARIO ===
export async function saveLocation(location) {
    const db = await getDB();
    const tx = db.transaction(LOCATIONS_STORE, 'readwrite');
    const locationData = {
        ...location,
        timestamp: Date.now()
    };
    await tx.store.add(locationData);
    await tx.done;

    // Mantener solo las últimas 100 ubicaciones
    await cleanOldLocations();
}

export async function getLastLocation() {
    const db = await getDB();
    const tx = db.transaction(LOCATIONS_STORE, 'readonly');
    const index = tx.store.index('timestamp');
    const locations = await index.getAll();
    return locations.length > 0 ? locations[locations.length - 1] : null;
}

async function cleanOldLocations(keepLast = 100) {
    const db = await getDB();
    const tx = db.transaction(LOCATIONS_STORE, 'readwrite');
    const allLocations = await tx.store.getAll();

    if (allLocations.length > keepLast) {
        const toDelete = allLocations.slice(0, allLocations.length - keepLast);
        for (const loc of toDelete) {
            await tx.store.delete(loc.id);
        }
    }
    await tx.done;
}

// === TILES PARA OFFLINE ===
export async function saveTile(url, blob, z, x, y) {
    const db = await getDB();
    const tx = db.transaction(TILES_STORE, 'readwrite');
    await tx.store.put({
        url,
        blob,
        z,
        x,
        y,
        timestamp: Date.now()
    });
    await tx.done;
}

export async function getTile(url) {
    const db = await getDB();
    const tile = await db.get(TILES_STORE, url);
    return tile?.blob || null;
}

export async function cleanOldTiles(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 días
    const db = await getDB();
    const tx = db.transaction(TILES_STORE, 'readwrite');
    const cutoff = Date.now() - maxAge;

    const index = tx.store.index('timestamp');
    const oldTiles = await index.getAll(IDBKeyRange.upperBound(cutoff));

    for (const tile of oldTiles) {
        await tx.store.delete(tile.url);
    }
    await tx.done;
}

// === UBICACIONES GUARDADAS CON NOMBRES ===
export async function saveNamedLocation(name, lat, lng, description = '') {
    const db = await getDB();
    const tx = db.transaction(SAVED_LOCATIONS_STORE, 'readwrite');
    
    const savedLocation = {
        name: name.trim(),
        lat,
        lng,
        description: description.trim(),
        timestamp: Date.now(),
        createdAt: new Date().toISOString()
    };
    
    const result = await tx.store.add(savedLocation);
    await tx.done;
    return result;
}

export async function getSavedLocations() {
    const db = await getDB();
    const tx = db.transaction(SAVED_LOCATIONS_STORE, 'readonly');
    const locations = await tx.store.getAll();
    await tx.done;
    
    // Ordenar por timestamp descendente (más recientes primero)
    return locations.sort((a, b) => b.timestamp - a.timestamp);
}

export async function deleteSavedLocation(id) {
    const db = await getDB();
    const tx = db.transaction(SAVED_LOCATIONS_STORE, 'readwrite');
    await tx.store.delete(id);
    await tx.done;
}

export async function updateSavedLocation(id, updates) {
    const db = await getDB();
    const tx = db.transaction(SAVED_LOCATIONS_STORE, 'readwrite');
    
    const existing = await tx.store.get(id);
    if (!existing) {
        throw new Error('Ubicación no encontrada');
    }
    
    const updated = {
        ...existing,
        ...updates,
        timestamp: Date.now() // Actualizar timestamp de modificación
    };
    
    await tx.store.put(updated);
    await tx.done;
    return updated;
}

export async function getSavedLocationByName(name) {
    const db = await getDB();
    const tx = db.transaction(SAVED_LOCATIONS_STORE, 'readonly');
    const index = tx.store.index('name');
    const location = await index.get(name.trim());
    await tx.done;
    return location;
}
// FIN CAMBIO - Archivo: src/services/db.js