const express = require("express");
const router = express.Router();
const LikeImage = require("../model/LikeImage");
const Image = require("../model/Image");

router.post("/", async (req, res) => {
  const email=req.body.email;
  const imageID = req.body.imageID;
  try {
    const images = await LikeImage.find({email: email});
    const heartCount = (await Image.findOne({generationID: imageID})).heartCount;
    res.json({images: images, heartCount: heartCount ? heartCount : 0});
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Fail" });
  }
});

module.exports = router;
