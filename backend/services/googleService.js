const fetch = global.fetch || require('node-fetch');

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

function hasGoogleKey() {
  return Boolean(GOOGLE_API_KEY && GOOGLE_API_KEY.trim());
}

async function placesAutocomplete(query) {
  if (!hasGoogleKey()) throw new Error('GOOGLE_MAPS_API_KEY not configured');
  const params = new URLSearchParams({
    input: query,
    key: GOOGLE_API_KEY,
  });
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Places API error ${resp.status}`);
  const data = await resp.json();
  return data;
}

async function directionsWithTraffic({ origin, destination }) {
  if (!hasGoogleKey()) throw new Error('GOOGLE_MAPS_API_KEY not configured');
  // Using Directions API with departure_time=now to get duration_in_traffic
  const params = new URLSearchParams({
    origin,
    destination,
    key: GOOGLE_API_KEY,
    departure_time: 'now'
  });
  const url = `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Directions API error ${resp.status}`);
  const data = await resp.json();
  return data;
}

module.exports = { hasGoogleKey, placesAutocomplete, directionsWithTraffic };




