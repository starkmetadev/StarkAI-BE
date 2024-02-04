'use strict';

const mongoose = require("mongoose");

const schema = mongoose.Schema({
  address: {
    type: String,
    require: true,
    unique: true
  },
  name: {
    type: String,
    require
  },
  email: {
    type: String,
  },
  bio: {
    type: String,
    default: 'I make art with the simple goal of giving you something pleasing to look at for a few seconds.'
  },
  avatar: String,
  socials: {
    type: Map,
    of: String
  },
  followers: [String]
});

module.exports = new mongoose.model("MarketUser", schema);