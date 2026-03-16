const mongoose = require("mongoose");

const amazonLeadSchema = new mongoose.Schema({

  sellerId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  sellerName: {
    type: String,
    required: true,
    trim: true
  },

  sellerLink: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  fulfillment: {
    type: String,
    enum: ["FBA", "FBM", "Vendor", "Unknown"],
    default: "Unknown"
  },

  businessName: {
    type: String,
    trim: true
  },

  businessType: {
    type: String,
    trim: true
  },

  tradeRegisterNumber: {
    type: String,
    trim: true
  },

  vatNumber: {
    type: String,
    trim: true
  },

  phoneNumber: {
    type: String,
    trim: true
  },

  address: {
    type: String,
    trim: true
  },

  postcode: {
    type: String,
    trim: true,
    uppercase: true
  },

  city: {
    type: String,
    trim: true
  },

  country: {
    type: String,
    default: "UK"
  },

  sellerRating: {
    type: String
  },

  ratingPercentage: {
    type: String
  },

  totalRatings: {
    type: Number
  },

  productUrl: {
    type: String
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("AmazonLead", amazonLeadSchema);