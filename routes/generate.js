const express = require("express");
const fs = require("fs");
const router = express.Router();

const engineId = "stable-diffusion-v1-6";
const apiHost = process.env.API_HOST ?? "https://api.stability.ai";
const apiKey = process.env.STABILITY_API_KEY;
const Upload = require("../data/upload");

if (!apiKey) throw new Error("Missing Stability API Key.");

router.post("/text-to-image", async (req, res) => {
  const response = await fetch(
    `${apiHost}/v1/generation/${engineId}/text-to-image`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: req.body.text,
          },
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        steps: 30,
        samples: 1,
      }),
    }
  );
  if (!response.ok) {
    res.send({ message: "Failed" });
    throw new Error(`Non-200 response: ${await response.text()}`);
  }

  const responseJSON = await response.json();

  if (
    !responseJSON ||
    !responseJSON.artifacts ||
    !Array.isArray(responseJSON.artifacts)
  ) {
    console.log("Invalid response or artifacts data");
    res.status(500).send({ error: "Invalid response data" });
    return;
  }

  const uploadPromises = responseJSON.artifacts.map(async (image, index) => {
    try {
      return await Upload(
        `${req.body.user}/${req.body.text}`,
        Buffer.from(image.base64, "base64")
      );
    } catch (uploadError) {
      console.log("Error uploading file:", uploadError);
      throw uploadError; // rethrow the error to be caught by the outer try-catch block
    }
  });

  try {
    await Promise.all(uploadPromises);
    res.send({ message: "Success" });
  } catch (error) {
    res.status(500).send({ error: "An error occurred during upload" });
  }
});

module.exports = router;
