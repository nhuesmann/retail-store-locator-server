/* eslint no-unused-vars: 0 */
/* eslint function-paren-newline: 0 */

const axios = require('axios');

const Retailer = require('../models/retailer');
const { runGeoQuery } = require('../helpers/geolocation');
const { parseCsv } = require('../helpers/csv');
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
  const address = `${retailer.address}, ${retailer.city}, ${retailer.state} ${
    retailer.zip
  }`;

  const googleResponse = await googleMapsClient
    .geocode({ address })
    .asPromise();

  if (googleResponse.json.status !== 'OK') {
    // TODO: handle error, return something!
    console.log(googleResponse.json.status);
    console.log(retailer);
  } else {
    const { lat, lng } = googleResponse.json.results[0].geometry.location;

    return truncateCoordinates([lng, lat]);
  }
}

async function createRetailer(retailer) {
  const geocoded = await geocodeAddress(retailer);

  return new Retailer({
    location: {
      coordinates: geocoded, // lng, lat
    },
    name: retailer.retailer,
    address: retailer.address,
    city: retailer.city,
    state: retailer.state,
    zip: retailer.zip,
    launch_date: retailer.launch_date,
    recipes_offered: retailer.recipes_offered,
  }).save();
}

async function processRetailer(retailer) {
  // check if retailer exists
  const existingRetailer = await Retailer.findOne(
    {
      name: capitalize(retailer.retailer),
      address: capitalize(retailer.address),
    },
    '_id'
  );

  // if retailer exists, do not process and exclude from response
  if (existingRetailer) return null;

  // process the retailer (geocode and save)
  const newRetailer = await createRetailer(retailer);

  // TODO: Need to look into error here
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
  const csv = (await axios.get(process.env.GOOGLE_SHEET_URL)).data;

  // get the retailers
  const retailers = parseCsv(csv);

  // process them
  const newRetailers = await Promise.all(
    retailers.map(retailer => processRetailer(retailer))
  );

  res.json(newRetailers);
};
