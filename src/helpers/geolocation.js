exports.runRetailerQuery = async (req, res, Model) => {
  const {
    lng,
    lat,
    searchRadius = 10,
    includeFutureLocations = false,
  } = req.query;

  if (includeFutureLocations || (!lng || !lat)) {
    return Model.find({});
  }

  const milesPerKilometer = 1.60934;
  const earthRadius = 6371;

  const validLatLng = lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

  if (!validLatLng) {
    res.json({ error: 'Invalid location' });
  }

  const maxDistance = searchRadius * milesPerKilometer / earthRadius;

  const now = new Date();
  const today = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  );

  const query = Model.find();
  query
    .where('launch_date')
    .lte(today)
    .where('location')
    .near({ center: [lng, lat], spherical: true, maxDistance });

  return query.exec();
};
