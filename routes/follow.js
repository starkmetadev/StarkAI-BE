const express = require("express");
const router = express.Router();
const User = require("../model/User");
const Image = require("../model/Image");

router.post("/handle-follower", async (req, res) => {
  try {
    const { email, creator } = req.body;

    // Find the user by email
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the creator is already in the followers' list
    const index = user.follower.indexOf(creator);

    if (index === -1) {
      // If the creator is not found in followers, add it
      user.follower.push(creator);
      console.log("Added follower:", creator);
    } else {
      // If the creator is found, remove it from followers
      user.follower.splice(index, 1);
      console.log("Removed follower:", creator);
    }

    // Save changes to the user
    await user.save();

    // Send back some response, e.g., confirmation of action taken
    res.status(200).json({
      message: index === -1 ? "Follower added" : "Follower removed",
    });
  } catch (error) {
    // Handle errors e.g. database connection issues or other
    console.error("An error occurred:", error);
    res.status(500).send("An error occurred while updating the follower list");
  }
});

router.post("/get-follower", async (req, res) => {
  try {
    const { email } = req.body;
    // Corrected by adding `await` to make sure the database query is resolved.
    let user = await User.findOne({ email });

    if (!user) {
      // Send a 404 status code if no user is found.
      return res.status(404).json({ message: "User not found" });
    }

    // Respond with the user's followers.
    return res.status(200).json({
      message: "Followers retrieved successfully",
      followers: user.follower,
    });
  } catch (error) {
    // Log the error and send a 500 status code indicating a server error.
    console.error("Error fetching followers:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while retrieving followers" });
  }
});

router.post("/get-follower-image", async (req, res) => {
  try {
    const { creator, email } = req.body;

    if (!creator) {
      return res.status(400).json({ message: "No Followers" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let fetchedImages = await Image.find({ owner: creator });

    return res.status(200).json({
      message: "Fetched Images!",
      fetchedImages,
    });
  } catch (error) {
    // Handle server errors
    console.error(`Error fetching images: ${error}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
