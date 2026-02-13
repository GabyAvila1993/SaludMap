// Servicio mock para obtener precios por establecimiento y tipo de servicio
// Esto puede reemplazarse por una llamada real al backend cuando exista la API.

const SERVICE_TYPES = {
  consulta_general: 'Consulta general',
  urgencias: 'Urgencias',
  consulta_privada: 'Consulta privada'
};

// Hash simple y determinista para generar precios a partir del id/nombre
function deterministicPriceSeed(key) {
  if (!key) return 42;
  let sum = 0;
  for (let i = 0; i < key.length; i++) sum = (sum * 31 + key.charCodeAt(i)) % 100000;
  return sum;
}

export async function fetchPricesForPlaces(placeIds = [], service = 'consulta_general') {
  // Simular latencia
  await new Promise((r) => setTimeout(r, 200));

  const prices = placeIds.map((p) => {
    // placeIds may be strings (keys) or objects; normalizamos
    const key = typeof p === 'string' ? p : (p.id || p.establecimientoId || p.name || p.nombre || JSON.stringify(p));
    const seed = deterministicPriceSeed(String(key));

    // Rango base por tipo en Dólares (USD)
    const baseByType = {
      consulta_general: 40, // USD
      urgencias: 80, // USD
      consulta_privada: 60 // USD
    };

    const base = baseByType[service] || 40;

    // Generar precio en torno al base, variación por seed
    const variation = (seed % 40) - 20; // -20 .. +19
    let price = Math.round(base + variation);

    // Asegurarse que el precio esté en el rango de 15 a 100 USD
    price = Math.max(15, Math.min(100, price));

    return {
      placeId: key,
      name: (typeof p === 'string' ? p : (p.name || p.nombre || p.tags?.name || p.tags?.shop || 'Establecimiento')),
      service: service,
      price
    };
  });

  return prices;
}

export function getServiceTypes() {
  return SERVICE_TYPES;
}
