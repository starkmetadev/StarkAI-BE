const express = require("express");
const router = express.Router();
const Image = require("../model/Image");

router.post("/", async (req, res) => {
  try {
    const images = await (await Image.find({image: {$regex: /\.jpg$/}}).sort({_id: -1}).limit(12));
    res.json(images);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Fail" });
  }
});

module.exports = router;
