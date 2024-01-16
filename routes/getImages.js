const express = require("express");
const router = express.Router();
const Image = require("../model/Image");

router.post("/", async (req, res) => {
  const email = req.body.email;
  try {
    const images = await Image.find({ owner: email });
    res.json(images);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Fail" });
  }
});

module.exports = router;
