const express = require("express");
const router = express.Router();
const LikeImage = require("../model/LikeImage");
const Image = require("../model/Image");

router.post("/", async (req, res) => {
  const email=req.body.email;
  const imageID=req.body.imageID;
  try {
    const image = await Image.findOne({generationID: imageID});
    const heartCount = image.heartCount?image.heartCount:0;
    const like = await LikeImage.findOneAndDelete({email: email, imageID: imageID})
    if(like) {
      await image.updateOne({heartCount: heartCount-1});
      res.json({msg: "Deleted!", heartCount: heartCount-1});
    }
    else {
      const likeImage = new LikeImage({email:email, imageID: imageID});
      likeImage.save();
      await image.updateOne({heartCount: heartCount+1});
      res.json({msg: "Added!", heartCount: heartCount+1});
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Fail" });
  }
});

module.exports = router;
