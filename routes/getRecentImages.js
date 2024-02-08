const express = require("express");
const router = express.Router();
const Image = require("../model/Image");

router.post("/", async (req, res) => {
  try {
    const images = await Image.find().limit(10);
    res.json(images);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Fail" });
  }
});

module.exports = router;
