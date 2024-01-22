const { default: axios } = require("axios");
const express = require("express");
const router = express.Router();
const Image = require("../model/Image");

const saveImages = async (username, generationID, numberOfImages, detail) => {
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
      if (
        response.data.generations_by_pk.generated_images.length ===
        numberOfImages
      ) {
        break;
      }
    } catch (error) {
      console.error(error);
    }
    await wait(3000);
  }

  const generatedImages = response.data.generations_by_pk.generated_images;
  const created = response.data.generations_by_pk.createdAt;
  console.log(generatedImages);
  for (let i = 0; i < generatedImages.length; i++) {
    const imageData = new Image({
      image: generatedImages[i].url,
      owner: username,
      created: created,
      data: detail,
    });
    await imageData.save();
  }
};

router.post("/text-to-image", async (req, res) => {
  const {
    user: username,
    text: prompt,
    model,
    alchemy,
    presetStyle,
    numberOfImages,
    dimension,
  } = req.body;
  console.log(req.body);
  let style, wid, hei;
  wid = parseInt(dimension.split("*")[0]);
  hei = parseInt(dimension.split("*")[1]);
  console.log(wid, hei);
  switch (presetStyle) {
    case "3D Render":
      style = "RENDER_3D";
      break;
    case "Sketch B/W":
      style = "SKETCH_BW";
      break;
    case "Sketch Color":
      style = "SKETCH_COLOR";
      break;
    case "StarkAI":
      style = "LEONARDO";
      break;
    default:
      style = presetStyle.toUpperCase();
  }
  const options = {
    method: "POST",
    url: "https://cloud.leonardo.ai/api/rest/v1/generations",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${process.env.LEONARDO_API_KEY}`,
    },
    data: {
      height: hei,
      modelId: model,
      prompt: prompt,
      width: wid,
      num_images: numberOfImages,
      alchemy: alchemy,
      presetStyle: style,
    },
  };
  let imageData;
  await axios
    .request(options)
    .then(function (response) {
      imageData = response.data;
    })
    .catch(function (error) {
      console.error(error);
      res.status(200).send({ message: "Fail" });
    });

  await saveImages(
    username,
    imageData.sdGenerationJob.generationId,
    numberOfImages,
    options.data
  );
  res.status(200).send({ message: "Success" });
});

module.exports = router;
