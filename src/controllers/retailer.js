/* eslint no-unused-vars: 0 */
/* eslint function-paren-newline: 0 */

const axios = require('axios');

const Retailer = require('../models/retailer');
const { runGeoQuery } = require('../helpers/geolocation');
const { parseCsv, cleanseAddresses } = require('../helpers/csv');
const { capitalize, truncateCoordinates } = require('../helpers/utility');

const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_API_KEY,
  Promise: Promise, // eslint-disable-line object-shorthand
  rate: {
    limit: 50,
    period: 1000,
  },
});

// eslint-disable-next-line consistent-return
async function geocodeAddress(retailer) {
  const address = `${retailer.address_1}, ${retailer.city}, ${retailer.state} ${
    retailer.zip
  }`;

  const googleResponse = await googleMapsClient
    .geocode({ address })
    .asPromise();

  if (googleResponse.json.status !== 'OK') {
    return {
      error: googleResponse.json.status,
      coordinates: null,
      zip: null,
    };
  }

  const { lat, lng } = googleResponse.json.results[0].geometry.location;

  let zip;

  if (!retailer.zip) {
    zip = googleResponse.json.results[0].address_components.find(
      component => component.types[0] === 'postal_code'
    );
  }

  return {
    error: null,
    coordinates: truncateCoordinates([lng, lat]),
    zip: zip ? zip.long_name : null,
  };
}

async function createRetailer(retailer) {
  const { coordinates, zip, error } = await geocodeAddress(retailer);

  if (error) return { error, retailer };

  return new Retailer({
    location: {
      coordinates, // [lng, lat]
    },
    ...retailer,
    zip: zip || retailer.zip,
  }).save();
}

async function processRetailer(retailer) {
  // check if retailer exists
  const existingRetailer = await Retailer.findOne(
    {
      name: capitalize(retailer.name),
      address_1: capitalize(retailer.address_1),
    },
    '_id'
  );

  // if retailer exists, do not process and exclude from response
  if (existingRetailer) return null;

  // process the retailer (geocode and save)
  const newRetailer = await createRetailer(retailer);
  return newRetailer;
}

exports.ListRetailers = async function ListRetailers(req, res, next) {
  if (req.query && req.query.lat && req.query.lng) {
    return runGeoQuery(req, res, Retailer);
  }

  const retailers = await Retailer.find({});
  res.json(retailers);
};

exports.CreateRetailer = async function CreateRetailer(req, res, next) {
  const savedRetailer = await createRetailer(req.body);

  res.status(201).json(savedRetailer);
};

exports.test = async function test(req, res, next) {
  res.json({ message: 'hi!' });
};

exports.SyncRetailers = async function SyncRetailers(req, res, next) {
  const csvBuffer = (await axios.get(process.env.GOOGLE_SHEET_URL)).data;
  const csv = parseCsv(csvBuffer);

  const retailers = cleanseAddresses(csv);

  const processedRetailers = await Promise.all(
    retailers.map(retailer => processRetailer(retailer))
  );

  const errors = processedRetailers.filter(
    retailer => retailer && retailer.error
  );

  const newRetailers = processedRetailers.filter(
    retailer => retailer && !retailer.error
  );

  let responseObj = {
    errors,
    message: 'No new retailers added.',
    new_retailers: [],
  };

  if (newRetailers.length > 0) {
    responseObj = {
      errors,
      message: `${newRetailers.length} of ${
        retailers.length
      } retailers added successfully.`,
      new_retailers: newRetailers,
    };
  }

  res.json(responseObj);
};
