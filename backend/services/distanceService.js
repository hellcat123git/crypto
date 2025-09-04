const fetch = global.fetch || require('node-fetch');

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
  const resp = await fetch(url, { headers: { 'User-Agent': 'dynamic-pricing-sim/1.0' } });
  if (!resp.ok) throw new Error(`Geocoding error ${resp.status}`);
  const data = await resp.json();
  if (!data || !data.length) throw new Error('No results for location');
  const { lat, lon, display_name } = data[0];
  return { lat: parseFloat(lat), lon: parseFloat(lon), displayName: display_name };
}

function estimateTrafficIndex(avgSpeedKmh) {
  // Simple heuristic: lower speeds -> higher traffic index
  // 0-15 km/h => 10, 15-25 => 8, 25-35 => 6, 35-45 => 4, 45-60 => 3, >60 => 2
  if (avgSpeedKmh <= 15) return 10;
  if (avgSpeedKmh <= 25) return 8;
  if (avgSpeedKmh <= 35) return 6;
  if (avgSpeedKmh <= 45) return 4;
  if (avgSpeedKmh <= 60) return 3;
  return 2;
}

function estimatePrice({ distanceKm, durationMin, trafficIndex, baseFare = 50, perKm = 12, perMin = 1 }) {
  const raw = baseFare + distanceKm * perKm + durationMin * perMin;
  const trafficMultiplier = 1 + (trafficIndex - 5) * 0.05; // index 5 -> 1.0, 10 -> 1.25, 2 -> 0.85
  const price = raw * trafficMultiplier;
  return { rawPrice: raw, trafficMultiplier: parseFloat(trafficMultiplier.toFixed(2)), estimatedPrice: parseFloat(price.toFixed(2)) };
}

async function routeDistance({ origin, destination, baseFare, perKm, perMin }) {
  const o = await geocode(origin);
  const d = await geocode(destination);
  const url = `https://router.project-osrm.org/route/v1/driving/${o.lon},${o.lat};${d.lon},${d.lat}?overview=false`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Routing error ${resp.status}`);
  const data = await resp.json();
  const route = data && data.routes && data.routes[0];
  if (!route) throw new Error('No route found');

  const distanceMeters = route.distance;
  const durationSeconds = route.duration;
  const distanceKm = distanceMeters / 1000;
  const durationMin = durationSeconds / 60;
  const avgSpeedKmh = (distanceKm) / (durationSeconds / 3600);
  const trafficIndex = estimateTrafficIndex(avgSpeedKmh);
  const priced = estimatePrice({ distanceKm, durationMin, trafficIndex, baseFare, perKm, perMin });

  return {
    origin: { query: origin, ...o },
    destination: { query: destination, ...d },
    distance_meters: distanceMeters,
    duration_seconds: durationSeconds,
    avg_speed_kmh: parseFloat(avgSpeedKmh.toFixed(1)),
    traffic_index: trafficIndex,
    price: priced
  };
}

module.exports = { routeDistance };
