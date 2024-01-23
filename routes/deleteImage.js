const express = require("express");
const router = express.Router();
const Image = require("../model/Image");

router.post("/", async (req, res) => {
  const image = req.body.image;
  const result = await Image.findOneAndDelete({ image: image });
  console.log("Document deleted:", result);
  res.status(200).send({ message: "Success" });
});

module.exports = router;
