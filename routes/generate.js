const { default: axios } = require("axios");
const express = require("express");
const router = express.Router();
const Image = require("../model/Image");

const saveImage = async (username, generationID) => {
  const options = {
    method: "GET",
    url: `https://cloud.leonardo.ai/api/rest/v1/generations/${generationID}`,
    headers: {
      accept: "application/json",
      authorization: `Bearer ${process.env.LEONARDO_API_KEY}`,
    },
  };

  let response;
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  while (true) {
    try {
      response = await axios.request(options);
      if (response.data.generations_by_pk.generated_images.length >= 1) {
        break;
      }
    } catch (error) {
      console.error(error);
    }
    await wait(3000);
  }

  console.log(response.data);
  const data = new Image({
    image: response.data.generations_by_pk.generated_images[0].url,
    owner: username,
    created: response.data.generations_by_pk.createdAt,
  });

  return await data.save();
};

router.post("/text-to-image", async (req, res) => {
  const { user: username, text: prompt } = req.body;
  console.log(req.body);
  const options = {
    method: "POST",
    url: "https://cloud.leonardo.ai/api/rest/v1/generations",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${process.env.LEONARDO_API_KEY}`,
    },
    data: {
      height: 1024,
      modelId: "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3",
      prompt: prompt,
      width: 1024,
      num_images: 1,
    },
  };
  // await saveImage(username, "f71c1a78-8dfa-46ee-aa16-bc82b602ed68");
  let imageData;
  await axios
    .request(options)
    .then(function (response) {
      console.log(response.data);
      imageData = response.data;
    })
    .catch(function (error) {
      console.error(error);
      res.status(200).send({ message: "Fail" });
    });

  await saveImage(username, imageData.sdGenerationJob.generationId);
  res.status(200).send({ message: "Success" });
});

module.exports = router;
