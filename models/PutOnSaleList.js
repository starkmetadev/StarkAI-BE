'use strict';

const mongoose = require("mongoose");

const schema = mongoose.Schema({
  key: {
    type: String
  },
  collectionId: {
    type: String,
    require: true,
  },
  maker: {
    type: String,
    require: true
  },
  chainId: {
    type: Number,
  },
  tokenId: {
    type: String
  },
  royaltyFee: Number,
  price: String,
  category: String,
  isAlive: Boolean,
  tags: {
    type: Map,
    of: String
  }
});

module.exports = new mongoose.model("PutOnSaleList", schema);