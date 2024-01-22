const express = require("express");
const router = express.Router();
const User = require("../model/User");
const generate = require("./generate");
const getImages = require("./getImages");
const getAllImages = require("./getAllImages");

router.post("/login", async (req, res) => {
  const { username, email, password } = req.body;
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
        const tmp = new User({ username: username, email: email });
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

module.exports = router;
