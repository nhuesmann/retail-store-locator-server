exports.runGeoQuery = async (req, res, Model) => {
  const { lng, lat, searchRadius = 50 } = req.query;

  const milesPerKilometer = 1.60934;
  const earthRadius = 6371;

  const validLatLng = lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

  if (!validLatLng) {
    res.json({ error: 'Invalid location' });
  }

  const maxDistance = searchRadius * milesPerKilometer / earthRadius;

  const query = Model.find();
  query
    .where('location')
    .near({ center: [lng, lat], spherical: true, maxDistance });

  const locations = await query.exec();

  res.json(locations);
};
