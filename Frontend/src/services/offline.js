// src/services/offline.js
import { savePlaces } from './db.js';

// Conversión lat/lng a tiles OSM
function long2tile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

function lat2tile(lat, zoom) {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
}

// Precargar tiles y lugares
export async function precargarArea(bounds, zoomLevels = [14, 15], fetchPlacesFn) {
  const cache = await caches.open('osm-tiles');

  const { north, south, east, west } = bounds;

  // 1️⃣ Precarga de tiles
  for (const z of zoomLevels) {
    const xMin = long2tile(west, z);
    const xMax = long2tile(east, z);
    const yMin = lat2tile(north, z);
    const yMax = lat2tile(south, z);

    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        const url = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
        try {
          const response = await fetch(url);
          await cache.put(url, response.clone());
        } catch (e) {
          console.warn('Error al descargar tile:', url, e);
        }
      }
    }
  }

  // 2️⃣ Precarga de lugares
  if (fetchPlacesFn) {
    const latStep = (north - south) / 5; // dividir área en una cuadrícula
    const lngStep = (east - west) / 5;

    for (let i = 0; i <= 5; i++) {
      for (let j = 0; j <= 5; j++) {
        const lat = south + i * latStep;
        const lng = west + j * lngStep;
        try {
          const lugares = await fetchPlacesFn({ lat, lng });
          await savePlaces(lugares);
        } catch (e) {
          console.warn('Error al precargar lugares:', lat, lng, e);
        }
      }
    }
  }
}
