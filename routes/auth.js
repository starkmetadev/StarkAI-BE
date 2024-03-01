const express = require("express");
const router = express.Router();
const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/email");
const generateVerificationCodeWithExpiry = require("../middleware/auth/generateVerificationCode");

router.post("/login", async (req, res) => {
  const { email, password, username, avatar } = req.body;

  let user = await User.findOne({ email });
  if (!password) {
    const newUser = new User({
      username,
      email,
      avatar,
      password: user?.password,
    });
    await newUser.save();

    // Generate a token for the new user
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({ message: "Success", token, email });
  } else {
    if (user && user.password) {
      // Compare provided password with stored hash
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        // Generate a token for the authenticated user
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
        return res.status(200).json({ message: "Success", token, email });
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
    const existingUser = await User.findOne({ email });

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

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Invalid email",
      });
    }
    const { verificationCode, expiryTime } =
      generateVerificationCodeWithExpiry();
    const subject = "Forgot password.";
    const content = `<html>
        <head>
          <title> Password reset url is here.</title>
        </head>
        <body>
          <div>
            verification code: ${verificationCode}, expiredTime: 10min
          </div>
          <div>
           This will be expired in 10 minutes.
        </div>
        </body>
      </html>`;
    const emailRes = await sendEmail(email, subject, content);
    if (emailRes === 200) {
      return res.status(200).json({
        message: "Verification code sent",
        verificationCode,
        expiryTime,
      });
    } else {
      return res.status(500).json({
        message: "Failed to send verification code",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Interval server error",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Invalid email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await user.updateOne({ password: hashedPassword });

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Interval server error",
    });
  }
});

module.exports = router;
