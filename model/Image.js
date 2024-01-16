const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  image: {
    required: true,
    type: String,
  },
  owner: {
    required: true,
    type: String,
  },
  created: {
    required: true,
    type: Date,
  },
});

module.exports = mongoose.model("Image", imageSchema);
