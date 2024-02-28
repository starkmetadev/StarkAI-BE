const express = require("express");
const router = express.Router();
const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  // Destructure fields from request body
  const { email, password, username, avatar } = req.body;

  if (!password) {
    const newUser = new User({ username, email, avatar });
    await newUser.save();

    // Generate a token for the new user
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({ message: "Success", token });
  } else {
    let user = await User.findOne({ email });

    if (user && user.password) {
      // Compare provided password with stored hash
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        // Generate a token for the authenticated user
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
        return res.status(200).json({ message: "Success", token });
      } else {
        // Password does not match
        return res.status(401).json({ message: "Password doesn't match!" });
      }
    } else {
      // No user found with given email
      return res.status(404).json({ message: "User not found!" });
    }
  }
});

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      console.log("Already exist");
      return res.status(400).json({ message: "User already exists" });
    }
    console.log("Registering");
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      email,
      password: hashedPassword,
    });

    // Save the new user to the database
    await newUser.save();
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error during registration" });
  }
});

module.exports = router;
