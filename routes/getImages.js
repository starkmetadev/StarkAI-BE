const express = require("express");
const router = express.Router();
const Image = require("../model/Image");
const LikeImage = require("../model/LikeImage");

router.post("/", async (req, res) => {
  const email = req.body.email;
  try {
    const images = await Image.find({ owner: email });
    const likeImages = await LikeImage.find({ email: email });
    const likeImageIds = likeImages.map((image) => {
      return image.imageID;
    });
    const reversedImages = [...images].reverse();
    const reversedLikeImageIds = [...likeImageIds].reverse();
    res.json({ images: reversedImages, likeImageIds: reversedLikeImageIds });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Fail" });
  }
});

module.exports = router;
