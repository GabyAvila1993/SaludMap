import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PlacesService {
  // Obtener lugares usando Overpass (mirrors, POST)
  async obtenerLugares(lat: number, lng: number, types?: string[], radius = 3000) {
    const endpoints = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
      'https://lz4.overpass-api.de/api/interpreter',
    ];

    const amenities = (types && types.length) ? types : ['hospital', 'clinic', 'doctors', 'veterinary'];

    const filters = amenities.map(a =>
      `node["amenity"="${a}"](around:${radius},${lat},${lng});
       way["amenity"="${a}"](around:${radius},${lat},${lng});
       relation["amenity"="${a}"](around:${radius},${lat},${lng});`
    ).join('\n');

    const query = `[out:json][timeout:25];
    (
      ${filters}
    );
    out center;`;

    let lastError: any = null;
    for (const url of endpoints) {
      try {
        const res = await axios.post(url, query, { headers: { 'Content-Type': 'text/plain' }, timeout: 20000, maxRedirects: 2 });
        if (res.status === 200 && res.data) return { lugares: res.data.elements ?? [], lejania: radius };
        lastError = res;
      } catch (err) {
        lastError = err;
      }
    }
    const message = 'No se pudo obtener datos de Overpass (timeout o servidor ocupado).';
    throw new HttpException({ error: message, detail: lastError?.message ?? String(lastError) }, HttpStatus.SERVICE_UNAVAILABLE);
  }
}

// Ruta Para probar en el Thunder Client
// http://localhost:3000/places?lat=-32.9716086&lng=-68.7911936&types=hospital