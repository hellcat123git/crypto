const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');
const { routeDistance } = require('../services/distanceService');
const { hasGoogleKey, placesAutocomplete, directionsWithTraffic } = require('../services/googleService');

router.get('/pricing/history', pricingController.getHistory);
router.post('/scenario', pricingController.postScenario);

router.get('/distance', async (req, res) => {
  const { origin, destination } = req.query || {};
  if (!origin || !destination) return res.status(400).json({ error: 'origin and destination are required' });
  try {
    const result = await routeDistance({ origin, destination });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to get distance' });
  }
});

router.get('/places/autocomplete', async (req, res) => {
  const { q } = req.query || {};
  if (!q) return res.status(400).json({ error: 'q is required' });
  try {
    if (!hasGoogleKey()) return res.status(400).json({ error: 'GOOGLE_MAPS_API_KEY not configured' });
    const data = await placesAutocomplete(q);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to fetch autocomplete' });
  }
});

router.get('/traffic', async (req, res) => {
  const { origin, destination } = req.query || {};
  if (!origin || !destination) return res.status(400).json({ error: 'origin and destination are required' });
  try {
    if (hasGoogleKey()) {
      const data = await directionsWithTraffic({ origin, destination });
      // Normalize a compact shape
      const route = data.routes?.[0];
      const leg = route?.legs?.[0];
      const out = {
        distance_meters: leg?.distance?.value,
        duration_seconds: leg?.duration?.value,
        duration_in_traffic_seconds: leg?.duration_in_traffic?.value ?? leg?.duration?.value,
        origin: leg?.start_address,
        destination: leg?.end_address,
      };
      return res.json(out);
    }
    // Fallback to OSRM
    const osrm = await routeDistance({ origin, destination });
    res.json({
      distance_meters: osrm.distance_meters,
      duration_seconds: osrm.duration_seconds,
      duration_in_traffic_seconds: osrm.duration_seconds,
      origin: osrm.origin.displayName,
      destination: osrm.destination.displayName,
    });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to fetch traffic' });
  }
});

module.exports = router;
