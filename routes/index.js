const express = require("express");
const router = express.Router();
const generate = require("./generate");
const getImages = require("./getImages");
const getAllImages = require("./getAllImages");
const deleteImage = require("./deleteImage");
const getRecentImages = require("./getRecentImages");
const getLikeImages = require("./getLikeImages");
const getSignedUrl = require("./getSignedUrl");

const putLikeImages = require("./putLikeImages");
const auth = require("./auth");

router.use("/auth", auth);
router.use("/generate", generate);
router.use("/getImages", getImages);
router.use("/getAllImages", getAllImages);
router.use("/deleteImage", deleteImage);
router.use("/getRecentImages", getRecentImages);
router.use("/getLikeImages", getLikeImages);
router.use("/getSignedUrl", getSignedUrl);
router.use("/putLikeImages", putLikeImages);

module.exports = router;
