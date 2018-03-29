const mongoose = require('mongoose');

const { Schema } = mongoose;

const { capitalize } = require('../helpers/utility');

const RetailerSchema = new Schema({
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number], // lng, lat
  },
  name: { type: String, trim: true, set: capitalize },
  address_1: { type: String, trim: true, set: capitalize },
  address_2: { type: String, trim: true, set: capitalize },
  city: { type: String, trim: true, set: capitalize },
  state: { type: String, trim: true, uppercase: true },
  zip: { type: String, trim: true },
  launch_date: Date,
  recipes_offered: Array,
});

RetailerSchema.index({ location: '2dsphere' });

const Retailer = mongoose.model('retailer', RetailerSchema);

module.exports = Retailer;
