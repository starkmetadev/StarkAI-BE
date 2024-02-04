'use strict';

const mongoose = require("mongoose");

const schema = mongoose.Schema({
  key: {
    type: String
  },
  chainId: {
    type: Number,
  },
  taker: {
    type: String
  },
  collectionId: {
    type: String,
    require: true,
  },
  tokenId: {
    type: String,
    require: true,
  },
  taker: {
    type: String
  },
  price: {
    type: String
  }
},
{ versionKey: false, timestamps: true }
);

module.exports = new mongoose.model("AuctionList", schema);