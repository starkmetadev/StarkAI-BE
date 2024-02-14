const express = require("express");
const router = express.Router();
const User = require("../model/User");

router.post("/", async (req, res) => {
  const userData = req.body;
  try {
    await User.findOneAndUpdate({email: userData.email}, {
      username: userData.username,
      avatar: userData.avatar
    });
    res.json({message: "Success"});
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Fail" });
  }
});

module.exports = router;
