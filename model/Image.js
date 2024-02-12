const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  generationID: {
    required: true,
    type: String,
  },
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
  data: {
    required: true,
    type: Object,
  },
  heartCount: {
    type: Number,
  }
});

module.exports = mongoose.model("Image", imageSchema);
