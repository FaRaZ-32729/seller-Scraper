// const mongoose = require("mongoose");

// const amazonLeadSchema = new mongoose.Schema({

//   sellerId: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true
//   },

//   sellerName: {
//     type: String,
//     required: true,
//     trim: true
//   },

//   sellerLink: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true
//   },

//   fulfillment: {
//     type: String,
//     enum: ["FBA", "FBM", "Vendor", "Unknown"],
//     default: "Unknown"
//   },

//   businessName: {
//     type: String,
//     trim: true,
//     default: null
//   },

//   businessType: {
//     type: String,
//     trim: true,
//     default: null
//   },

//   tradeRegisterNumber: {
//     type: String,
//     trim: true,
//     default: null
//   },

//   vatNumber: {
//     type: String,
//     trim: true,
//     default: null
//   },

//   phoneNumber: {
//     type: String,
//     trim: true,
//     default: null
//   },

//   email: {
//     type: String,
//     trim: true,
//     lowercase: true,
//     default: null
//   },

//   address: {
//     type: String,
//     trim: true,
//     default: null
//   },

//   postcode: {
//     type: String,
//     trim: true,
//     uppercase: true,
//     default: null
//   },

//   city: {
//     type: String,
//     trim: true,
//     default: null
//   },

//   country: {
//     type: String,
//     default: null
//   },

//   sellerRating: {
//     type: String,
//     default: null
//   },

//   ratingPercentage: {
//     type: String,
//     default: null
//   },

//   totalRatings: {
//     type: String,
//     default: null
//   },

//   productUrl: {
//     type: String,
//     default: null
//   }

// }, {
//   timestamps: true
// });

// module.exports = mongoose.model("AmazonLead", amazonLeadSchema);

const mongoose = require("mongoose");

const amazonLeadSchema = new mongoose.Schema({

  // ── Core identity ──────────────────────────────────────
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
    unique: true,
    trim: true
  },

  fulfillment: {
    type: String,
    enum: ["FBA", "FBM", "Vendor", "Unknown"],
    default: "Unknown"
  },

  // ── Business info ──────────────────────────────────────
  businessName: {
    type: String,
    trim: true,
    default: null
  },

  businessType: {
    type: String,
    trim: true,
    default: null
  },

  tradeRegisterNumber: {
    type: String,
    trim: true,
    default: null
  },

  vatNumber: {
    type: String,
    trim: true,
    default: null
  },

  // ── Contact ────────────────────────────────────────────
  phoneNumber: {
    type: String,
    trim: true,
    default: null
  },

  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: null
  },

  // ── Location ───────────────────────────────────────────
  address: {
    type: String,
    trim: true,
    default: null
  },

  postcode: {
    type: String,
    trim: true,
    uppercase: true,
    default: null
  },

  city: {
    type: String,
    trim: true,
    default: null
  },

  country: {
    type: String,
    default: "UK"
  },

  // ── Ratings ────────────────────────────────────────────
  sellerRating: {
    type: String,
    default: null
  },

  ratingPercentage: {
    type: String,
    default: null
  },

  totalRatings: {
    type: String,
    default: null
  },

  productUrl: {
    type: String,
    default: null
  },

  // ── Companies House verification ───────────────────────
  ownerName: {
    type: String,
    trim: true,
    default: null
  },

  ownerRole: {
    type: String,
    trim: true,
    default: null   // Director, Secretary, etc.
  },

  companyNumber: {
    type: String,
    trim: true,
    default: null   // Companies House company number
  },

  companiesHouseUrl: {
    type: String,
    trim: true,
    default: null
  },

  verifiedAt: {
    type: Date,
    default: null   // null = not yet verified
  }

}, {
  timestamps: true  // adds createdAt + updatedAt automatically
});

module.exports = mongoose.model("AmazonLead", amazonLeadSchema);