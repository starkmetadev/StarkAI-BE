const mongoose = require("mongoose");

const likeImageSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  imageID: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model("LikeImage", likeImageSchema);
