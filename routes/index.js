const express = require("express");
const router = express.Router();
const User = require("../model/User");
const generate = require("./generate");

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

module.exports = router;
