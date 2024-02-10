const express = require("express");
const router = express.Router();
const LikeImage = require("../model/LikeImage");

router.post("/", async (req, res) => {
  const email=req.body.email;
  try {
    const images = await (await LikeImage.find({email: email}));
    res.json(images);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Fail" });
  }
});

module.exports = router;
