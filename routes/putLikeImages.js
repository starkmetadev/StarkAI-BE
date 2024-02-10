const express = require("express");
const router = express.Router();
const LikeImage = require("../model/LikeImage");

router.post("/", async (req, res) => {
  const email=req.body.email;
  const imageID=req.body.imageID;
  try {
    const like = LikeImage.findOneAndUpdate({email: email}, {imageID: imageID})
    if(like)
      res.json({msg: "updated!"});
    else {
      const likeImage = new LikeImage({email:email, imageID: imageID});
      likeImage.save();
      res.json({msg: "new created!"});
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Fail" });
  }
});

module.exports = router;
