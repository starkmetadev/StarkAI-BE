const express = require("express");
const router = express.Router();
const User = require("../model/User");
const generate = require("./generate");
const getImages = require("./getImages");
const getAllImages = require("./getAllImages");
const deleteImage = require("./deleteImage");
const getRecentImages = require("./getRecentImages");
const getLikeImages = require("./getLikeImages");
const getSignedUrl = require("./getSignedUrl");

const putLikeImages = require("./putLikeImages");
const authUpdate = require("./authUpdate");

router.post("/login", async (req, res) => {
  const { username, email, password, avatar } = req.body;
  User.findOne({ email: email }).then((data) => {
    if (password) {
      //Login with email and password
      if (data.email === email && data.password === password)
        return res.send({ message: "Success" });
      else return res.send({ message: "Incorrect" });
    } else {
      //Login with google
      if (data) {
        //Login
        if (data.email === email) return res.send({ message: "Success" });
        else return res.send({ message: "Incorrect" });
      } else {
        const tmp = new User({ username: username, email: email, avatar: avatar});
        tmp.save();
        return res.send({ message: "Success" });
      }
    }
  });
});

router.post("/register", async (req, res) => {});

router.use("/generate", generate);
router.use("/getImages", getImages);
router.use("/getAllImages", getAllImages);
router.use("/deleteImage", deleteImage);
router.use("/getRecentImages", getRecentImages);
router.use("/getLikeImages", getLikeImages);
router.use("/getSignedUrl", getSignedUrl);

router.use("/putLikeImages", putLikeImages);
// router.use("/authUpdate", authUpdate);

module.exports = router;
