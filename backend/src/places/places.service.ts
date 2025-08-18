import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PlacesService {
    private readonly defaultTypes = ['hospital', 'clinic', 'doctors', 'veterinary'];
    private readonly searchRadio = [5000, 10000, 20000, 30000, 50000];

    async obtenerLugares(
        latitud: number,
        longitud: number,
        amenityTypes: string[] = this.defaultTypes
    ) {
        // Recorremos cada distancia de búsqueda
        for (const distancia of this.searchRadio) {
            const queries: string[] = [];

            for (const type of amenityTypes) {
                const query = `node["amenity"="${type}"](around:${distancia}, ${latitud}, ${longitud});`;
                queries.push(query);
            }

            const consultasCombinadas = queries.join('\n');

            const overpassQuery = `[out:json];
        (${consultasCombinadas});
        out;`;

            const encodedQuery = encodeURIComponent(overpassQuery);
            const apiUrl = `https://overpass-api.de/api/interpreter?data=${encodedQuery}`;

            const response = await axios.get(apiUrl);
            const lugaresEncontrados = response.data.elements;

            if (lugaresEncontrados.length > 0) {
                return {
                    lugares: lugaresEncontrados,
                    lejania: distancia
                };
            }
        }

        // Si no se encontró nada en ningún radio
        const distanciaMaxima = this.searchRadio[this.searchRadio.length - 1];
        return {
            lugares: ["No hay servicios cercanos"],
            lejania: distanciaMaxima
        };
    }
}

// Ruta Para probar en el Thunder Client
// http://localhost:3000/places?lat=-32.9716086&lng=-68.7911936&types=hospital