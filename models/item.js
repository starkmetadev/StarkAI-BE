'use strict';

const mongoose = require("mongoose");

const schema = mongoose.Schema({
  collectionId: {
    type: String,
    require: true,
  },
  chainId: {
    type: Number,
  },
  category: {
    type: String,
    default: 'Art'
  },
  subCategory: {
    type: String,
    default: 'Art'
  },
  metadata: {
    type: String,
  },
  tags: [String],
  likes: [String],
  tokenId: {
    type: String
  },
  mode: {
    type: Number,
    default: 0
  },
  maker: {
    type: String
  },
});

module.exports = new mongoose.model("Item", schema);