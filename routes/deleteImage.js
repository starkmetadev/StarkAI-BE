const express = require("express");
const router = express.Router();
const Image = require("../model/Image");

router.post("/", async (req, res) => {
  try {
    const image = req.body.image;
    console.log("image", image);
    await Image.findOneAndDelete({ image: image });
    console.log("image", image);
    res.status(200).send({ message: "Success" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).send({ message: "Server error" });
  }
});

module.exports = router;
