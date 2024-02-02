const { default: axios } = require("axios");
const fs = require("fs");
const os = require("os");
const express = require("express");
const router = express.Router();
const Image = require("../model/Image");
const FormData = require("form-data");
const stream = require("stream");
const Upload = require("../data/upload");
const path = require("path");

const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://www.starkmeta.ai",
      "https://starkmeta.ai",
    ],
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 1e8,
});

const multer = require("multer");
const fileUpload = multer({ dest: os.tmpdir() });

const headers = {
  accept: "application/json",
  "content-type": "application/json",
  authorization: `Bearer ${process.env.LEONARDO_API_KEY}`,
};

const waitForGeneration = async (generationID, numberOfImages) => {
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
    await wait(1000);
  }
};

const saveImages = async (username, generationID, detail, socket) => {
  const options = {
    method: "GET",
    url: `https://cloud.leonardo.ai/api/rest/v1/generations/${generationID}`,
    headers: headers,
  };

  let response = await axios.request(options);
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
    const uploadedUrl = await Upload(
      `${dir}/${generationID}/${name}`,
      response.data
    );
    const imageData = new Image({
      generationID: generatedImages[i].id,
      image: uploadedUrl,
      owner: username,
      created: created,
      data: detail,
    });
    await imageData.save();
    socket.emit("Image Saved", { id: i + 1, total: generatedImages.length });
  }
};

const saveMotion = async (username, generationID, detail, socket) => {
  const options = {
    method: "GET",
    url: `https://cloud.leonardo.ai/api/rest/v1/generations/${generationID}`,
    headers: headers,
  };

  let response = await axios.request(options);
  const generatedImages = response.data.generations_by_pk.generated_images;
  const created = response.data.generations_by_pk.createdAt;

  console.log(generatedImages);
  let uploadedUrl;
  {
    const url = generatedImages[0].url;
    const pos = url.lastIndexOf("/");
    var name = url.substring(pos + 1);
    name = name.replace("Leonardo", "Stark");
    const res = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });
    const pos1 = username.lastIndexOf("@");
    var dir = username.substring(0, pos1);
    await Upload(`${dir}/${generationID}/${name}`, res.data);
  }

  {
    const url = generatedImages[0].motionMP4URL;
    const pos = url.lastIndexOf("/");
    var name = url.substring(pos + 1);
    name = name.replace("Leonardo", "Stark");
    const res = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });
    const pos1 = username.lastIndexOf("@");
    var dir = username.substring(0, pos1);
    uploadedUrl = await Upload(`${dir}/${generationID}/${name}`, res.data);
  }

  const imageData = new Image({
    generationID: generatedImages[0].id,
    image: uploadedUrl,
    owner: username,
    created: created,
    data: detail,
  });
  await imageData.save();

  socket.emit("Motion Saved", { imageData });
};

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

    // formData.append("file", fs.createReadStream(imgData));
    formData.append("file", imgData);

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
    };
    const response = await axios.post(url, payload, { headers });

    return response.data.sdGenerationJob.generationId;
  } catch (error) {
    console.error(error);
  }
};

const handleGenerate = async (imgData, options) => {
  const uploadInitImage = await getImageUploadUrl();

  if (!uploadInitImage) return;

  const imageId = await uploadImage(uploadInitImage, imgData);

  if (!imageId) return;

  const generationId = await generateImageToImage(imageId, options);
  if (!generationId) return;

  await waitForGeneration(generationId, options.num_images);

  return generationId;
};

io.on("connection", (socket) => {
  socket.on("text-to-image", async (data) => {
    const {
      user: username,
      text: prompt,
      model,
      alchemy,
      presetStyle,
      numberOfImages,
      dimension,
    } = data;
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
      });

    await waitForGeneration(
      imageData.sdGenerationJob.generationId,
      numberOfImages
    );

    // res.status(200).send({ message: "Success" });
    socket.emit("Generation Complete", {
      total: numberOfImages,
    });

    await saveImages(
      username,
      imageData.sdGenerationJob.generationId,
      options.data,
      socket
    );

    socket.emit("Save Complete", { message: "All images saved." });
  });

  socket.on("image-to-image", async (data) => {
    const {
      user: username,
      text: prompt,
      model,
      alchemy,
      presetStyle,
      numberOfImages,
      dimension,
      density,
      image,
    } = data;
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
      init_strength: parseInt(density) / 100,
    };
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const id = await handleGenerate(buffer, options);

    socket.emit("Generation Complete", {
      total: options.num_images,
    });

    await saveImages(username, id, options, socket);

    socket.emit("Save Complete", { message: "All images saved." });
  });

  socket.on("image-to-motion", async (data) => {
    const { imageId, strength: motionStrength, imageData } = data;

    const options = {
      method: "POST",
      url: "https://cloud.leonardo.ai/api/rest/v1/generations-motion-svd",
      headers: headers,
      data: {
        imageId,
        motionStrength,
      },
    };

    await axios
      .request(options)
      .then(async function (response) {
        const res = response.data;
        await waitForGeneration(res.motionSvdGenerationJob.generationId, 1);
        await saveMotion(
          imageData.owner,
          res.motionSvdGenerationJob.generationId,
          imageData.data,
          socket
        );
      })
      .catch(function (error) {
        console.error(error);
      });
  });
});

server.listen(5001, () => {
  console.log("listening on *:5001");
});

module.exports = router;
