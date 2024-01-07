const express = require("express");
const router = express.Router();
const User = require("../model/User");

router.post("/login", async (req, res) => {
  res.send({ message: "Success" });
});

router.post("/register", async (req, res) => {
  res.send({ message: "Success" });
});

module.exports = router;
