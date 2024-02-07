const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    required: true,
    type: String,
  },
  email: {
    required: true,
    type: String,
  },
  avatar: {
    required: true,
    type: String,
  }
});

module.exports = mongoose.model("User", userSchema);
