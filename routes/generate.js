const { default: axios } = require("axios");
const fs = require("fs");
const os = require("os");
const express = require("express");
const router = express.Router();
const Image = require("../model/Image");
const FormData = require("form-data");
const stream = require("stream");
const Upload = require("../data/upload");

const multer = require("multer");
const fileUpload = multer({ dest: os.tmpdir() });

const headers = {
  accept: "application/json",
  "content-type": "application/json",
  authorization: `Bearer ${process.env.LEONARDO_API_KEY}`,
};

const saveImages = async (username, generationID, numberOfImages, detail) => {
  const options = {
    method: "GET",
    url: `https://cloud.leonardo.ai/api/rest/v1/generations/${generationID}`,
    headers: headers,
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

  for (let i = 0; i < generatedImages.length; i++) {
    const url = generatedImages[i].url;
    const pos = url.lastIndexOf("/");
    var name = url.substring(pos + 1);
    name = name.replace("Leonardo", "Stark");
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });
    const pos1 = username.lastIndexOf("@");
    var dir = username.substring(0, pos1);
    const uploadedUrl = await Upload(`${dir}/${name}`, response.data);
    const imageData = new Image({
      image: uploadedUrl,
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
  let style, wid, hei;
  wid = parseInt(dimension.split("*")[0]);
  hei = parseInt(dimension.split("*")[1]);
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
    headers: headers,
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

const getImageUploadUrl = async () => {
  try {
    const url = "https://cloud.leonardo.ai/api/rest/v1/init-image";
    const payload = { extension: "jpg" };

    const response = await axios.post(url, payload, { headers });

    return response.data.uploadInitImage;
  } catch (error) {
    console.error(error);
  }
};

const uploadImage = async (uploadInitImage, imgData) => {
  try {
    const url = uploadInitImage.url;
    const fields = JSON.parse(uploadInitImage.fields);
    const formData = new FormData();

    for (let key in fields) {
      formData.append(key, fields[key]);
    }

    formData.append("file", fs.createReadStream(imgData));

    // Axios will set the Content-Type to multipart/form-data boundary automatically.
    await axios.post(url, formData);

    return uploadInitImage.id; // Image ID for further actions
  } catch (error) {
    console.error(error);
  }
};

const generateImageToImage = async (imageId, options) => {
  try {
    const url = "https://cloud.leonardo.ai/api/rest/v1/generations";
    const payload = {
      ...options,
      init_image_id: imageId,
      init_strength: 0.5,
    };

    const response = await axios.post(url, payload, { headers });

    return response.data.sdGenerationJob.generationId;
  } catch (error) {
    console.error(error);
  }
};

const handleGenerate = async (username, imgData, options) => {
  const uploadInitImage = await getImageUploadUrl();
  if (!uploadInitImage) return;

  const imageId = await uploadImage(uploadInitImage, imgData);
  if (!imageId) return;

  const generationId = await generateImageToImage(imageId, options);
  if (!generationId) return;

  await saveImages(username, generationId, options.num_images, options);
};

router.post("/image-to-image", fileUpload.single("image"), async (req, res) => {
  const {
    user: username,
    text: prompt,
    model,
    alchemy,
    presetStyle,
    numberOfImages,
    dimension,
  } = req.body;
  let style, wid, hei;
  wid = parseInt(dimension.split("*")[0]);
  hei = parseInt(dimension.split("*")[1]);
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
    height: hei,
    modelId: model,
    prompt: prompt,
    width: wid,
    num_images: parseInt(numberOfImages),
    alchemy: alchemy === "true" ? true : false,
    presetStyle: style,
  };
  await handleGenerate(username, req.file.path, options);
  // const response = await axios({
  //   url: "https://cdn.leonardo.ai/users/90b23a91-bfa5-446f-9f2d-cfcbde716055/generations/9820f310-479d-4c74-8e8a-e39ba4517f77/Leonardo_Diffusion_XL_handsome_guy_with_white_shirt_and_sharp_0.jpg",
  //   method: "GET",
  //   responseType: "stream",
  // });

  // await Upload("2.jpg", response.data);
  res.status(200).send({ message: "Success" });
});

module.exports = router;
