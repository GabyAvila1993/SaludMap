// src/services/db.js
import { openDB } from 'idb';

const DB_NAME = 'saludmap-db';
const DB_VERSION = 1;
const STORE_NAME = 'places';

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('lat', 'lat');
        store.createIndex('lng', 'lng');
      }
    },
  });
}

// Guardar lugares
export async function savePlaces(places) {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  for (const p of places) {
    // Podés agregar una combinación lat-lng como clave si querés filtrar rápido
    await tx.store.put(p);
  }
  await tx.done;
}

// Obtener lugares cercanos
export async function getNearbyPlaces(center, radius = 0.02) {
  // radius ~ en grados (~2km aprox)
  const db = await getDB();
  const allPlaces = await db.getAll(STORE_NAME);
  return allPlaces.filter((p) => {
    const dLat = Math.abs(p.lat - center.lat);
    const dLng = Math.abs(p.lng - center.lng);
    return dLat <= radius && dLng <= radius;
  });
}
