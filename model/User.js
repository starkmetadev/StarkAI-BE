const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  email: {
    required: true,
    type: String,
  },
  avatar: {
    type: String,
  },
  password: {
    type: String,
  },
  follower: [
    {
      type: String,
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
