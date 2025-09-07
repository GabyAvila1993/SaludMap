import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { getTile, saveTile } from '../services/db.js';

// Custom tile layer that handles offline caching
const OfflineTileLayer = ({ url, attribution, ...props }) => {
    const map = useMap();
    const layerRef = useRef(null);

    useEffect(() => {
        // Create custom tile layer class
        const OfflineTileLayerClass = L.TileLayer.extend({
            createTile: function(coords, done) {
                const tile = document.createElement('img');
                const tileUrl = this.getTileUrl(coords);
                
                // Try to load from cache first
                this._loadFromCache(tileUrl, tile, coords, done);
                
                return tile;
            },

            _loadFromCache: async function(tileUrl, tile, coords, done) {
                try {
                    // Try to get cached tile
                    const cachedBlob = await getTile(tileUrl);
                    
                    if (cachedBlob) {
                        // Load from cache
                        const objectUrl = URL.createObjectURL(cachedBlob);
                        tile.onload = () => {
                            URL.revokeObjectURL(objectUrl);
                            done(null, tile);
                        };
                        tile.onerror = () => {
                            URL.revokeObjectURL(objectUrl);
                            this._loadFromNetwork(tileUrl, tile, coords, done);
                        };
                        tile.src = objectUrl;
                    } else {
                        // Not in cache, load from network
                        this._loadFromNetwork(tileUrl, tile, coords, done);
                    }
                } catch (error) {
                    console.warn('Error loading from cache:', error);
                    this._loadFromNetwork(tileUrl, tile, coords, done);
                }
            },

            _loadFromNetwork: function(tileUrl, tile, coords, done) {
                // Check if we're online
                if (!navigator.onLine) {
                    // Show placeholder for offline
                    tile.src = 'data:image/svg+xml;base64,' + btoa(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
                            <rect width="256" height="256" fill="#f0f0f0"/>
                            <text x="128" y="128" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="14" fill="#666">
                                Offline
                            </text>
                        </svg>
                    `);
                    done(null, tile);
                    return;
                }

                // Load from network and cache
                tile.onload = async () => {
                    try {
                        // Cache the tile for offline use
                        const response = await fetch(tileUrl);
                        if (response.ok) {
                            const blob = await response.blob();
                            await saveTile(tileUrl, blob, coords.z, coords.x, coords.y);
                        }
                    } catch (error) {
                        console.warn('Error caching tile:', error);
                    }
                    done(null, tile);
                };

                tile.onerror = (error) => {
                    // Show error placeholder
                    tile.src = 'data:image/svg+xml;base64,' + btoa(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
                            <rect width="256" height="256" fill="#ffebee"/>
                            <text x="128" y="128" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="12" fill="#c62828">
                                Error loading tile
                            </text>
                        </svg>
                    `);
                    done(error, tile);
                };

                tile.src = tileUrl;
            }
        });

        // Create and add the custom tile layer
        const offlineTileLayer = new OfflineTileLayerClass(url, {
            attribution: attribution,
            ...props
        });

        layerRef.current = offlineTileLayer;
        map.addLayer(offlineTileLayer);

        // Cleanup
        return () => {
            if (layerRef.current && map.hasLayer(layerRef.current)) {
                map.removeLayer(layerRef.current);
            }
        };
    }, [map, url, attribution]);

    // Return null since we're managing the layer manually
    return null;
};

export default OfflineTileLayer;
