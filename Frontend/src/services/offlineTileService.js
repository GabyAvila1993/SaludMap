// INICIO CAMBIO - Archivo: src/services/offlineTileService.js - Archivo nuevo para tiles offline
import { saveTile, getTile, cleanOldTiles } from './db.js';

class OfflineTileService {
    constructor() {
        this.isDownloading = false;
        this.downloadProgress = 0;
        this.onProgress = null;
    }

    // Crear URL personalizada para tiles offline
    createOfflineTileLayer() {
        return {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            options: {
                // Interceptor personalizado para tiles
                beforeRequest: async (url) => {
                    // Intentar cargar desde IndexedDB primero
                    const cachedTile = await getTile(url);
                    if (cachedTile) {
                        return URL.createObjectURL(cachedTile);
                    }
                    return url; // Usar URL original si no está en caché
                }
            }
        };
    }

    // Descargar tiles para un área específica
    async downloadTilesForArea(center, zoomLevels = [12, 13, 14, 15], radius = 0.02) {
        if (this.isDownloading) return;

        this.isDownloading = true;
        this.downloadProgress = 0;

        const tiles = this.calculateTilesForArea(center, zoomLevels, radius);
        const totalTiles = tiles.length;
        let downloadedCount = 0;

        console.log(`Descargando ${totalTiles} tiles para área offline...`);

        try {
            for (const tile of tiles) {
                try {
                    await this.downloadSingleTile(tile);
                    downloadedCount++;
                    this.downloadProgress = (downloadedCount / totalTiles) * 100;

                    if (this.onProgress) {
                        this.onProgress(this.downloadProgress, downloadedCount, totalTiles);
                    }

                    // Pequeña pausa para no sobrecargar el servidor
                    if (downloadedCount % 10 === 0) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                } catch (error) {
                    console.warn(`Error descargando tile ${tile.url}:`, error);
                }
            }

            console.log(`Descarga completada: ${downloadedCount}/${totalTiles} tiles`);
        } finally {
            this.isDownloading = false;
            this.downloadProgress = 100;
        }

        // Limpiar tiles antiguos
        await cleanOldTiles();
    }

    // Calcular qué tiles necesitamos para un área
    calculateTilesForArea(center, zoomLevels, radius) {
        const tiles = [];

        for (const zoom of zoomLevels) {
            const bounds = this.calculateTileBounds(center, radius, zoom);

            for (let x = bounds.minX; x <= bounds.maxX; x++) {
                for (let y = bounds.minY; y <= bounds.maxY; y++) {
                    const url = `https://a.tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
                    tiles.push({ url, z: zoom, x, y });
                }
            }
        }

        return tiles;
    }

    // Calcular límites de tiles para un área
    calculateTileBounds(center, radius, zoom) {
        const n = Math.pow(2, zoom);

        // Convertir lat/lng a números de tile
        const centerTileX = Math.floor(((center.lng + 180) / 360) * n);
        const centerTileY = Math.floor((1 - Math.log(Math.tan((center.lat * Math.PI) / 180) + 1 / Math.cos((center.lat * Math.PI) / 180)) / Math.PI) / 2 * n);

        // Calcular cuántos tiles necesitamos en cada dirección
        const tileRadius = Math.ceil((radius * n) / 360 * Math.cos((center.lat * Math.PI) / 180));

        return {
            minX: Math.max(0, centerTileX - tileRadius),
            maxX: Math.min(n - 1, centerTileX + tileRadius),
            minY: Math.max(0, centerTileY - tileRadius),
            maxY: Math.min(n - 1, centerTileY + tileRadius)
        };
    }

    // Descargar un tile individual
    async downloadSingleTile(tile) {
        try {
            const response = await fetch(tile.url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const blob = await response.blob();
            await saveTile(tile.url, blob, tile.z, tile.x, tile.y);
        } catch (error) {
            throw new Error(`Error descargando ${tile.url}: ${error.message}`);
        }
    }

    // Verificar si hay tiles offline disponibles
    async hasOfflineTiles() {
        // Esto se podría optimizar con un contador en IndexedDB
        try {
            const testTile = await getTile('test');
            return testTile !== null;
        } catch {
            return false;
        }
    }

    // Establecer callback para progreso de descarga
    setProgressCallback(callback) {
        this.onProgress = callback;
    }

    // Obtener estadísticas de tiles almacenados
    async getStorageStats() {
        // Esta función requeriría extender db.js para contar registros
        return {
            tilesCount: 0, // Placeholder
            storageSize: 0 // Placeholder
        };
    }

    // Limpiar todos los tiles (para liberar espacio)
    async clearAllTiles() {
        await cleanOldTiles(0); // Eliminar todos los tiles
    }
}

// Singleton
const offlineTileService = new OfflineTileService();
export default offlineTileService;
// FIN CAMBIO - Archivo: src/services/offlineTileService.js