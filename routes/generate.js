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
const request = require("request");

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
const sharp = require("sharp");
const fileUpload = multer({ dest: os.tmpdir() });

const headers = {
  accept: "application/json",
  "content-type": "application/json",
  authorization: `Bearer ${process.env.LEONARDO_API_KEY}`,
};

// const waitForGeneration = async (generationID, numberOfImages) => {
//   const options = {
//     method: "GET",
//     url: `https://cloud.leonardo.ai/api/rest/v1/generations/${generationID}`,
//     headers: headers,
//   };

//   let response;
//   const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//   while (true) {
//     try {
//       response = await axios.request(options);
//       if (
//         response.data.generations_by_pk.generated_images.length ===
//         numberOfImages
//       ) {
//         break;
//       }
//     } catch (error) {
//       console.error(error);
//     }
//     await wait(1000);
//   }
// };

// const saveImages = async (username, generationID, detail, socket) => {
//   const options = {
//     method: "GET",
//     url: `https://cloud.leonardo.ai/api/rest/v1/generations/${generationID}`,
//     headers: headers,
//   };

//   let response = await axios.request(options);
//   const generatedImages = response.data.generations_by_pk.generated_images;
//   const created = response.data.generations_by_pk.createdAt;

//   for (let i = 0; i < generatedImages.length; i++) {
//     const url = generatedImages[i].url;
//     const pos = url.lastIndexOf("/");
//     var name = url.substring(pos + 1);
//     name = name.replace("Leonardo", "Stark");
//     const response = await axios({
//       url,
//       method: "GET",
//       responseType: "stream",
//     });
//     const pos1 = username.lastIndexOf("@");
//     var dir = username.substring(0, pos1);
//     const smallimage = sharp().resize(512);
//     const originimage = sharp();
//     response.data.pipe(smallimage);
//     response.data.pipe(originimage);
//     // const processedImagePromise = new Promise((resolve, reject) => {
//     //   smallimage.on("finish", resolve);
//     //   smallimage.on("error", reject);
//     // });
//     // await processedImagePromise;
//     console.log("--------resized image-----------");
//     const smallurl = await Upload(`${dir}/${generationID}/${name}`, smallimage);
//     console.log(smallurl);
//     const imageData = new Image({
//       generationID: generatedImages[i].id,
//       image: smallurl,
//       owner: username,
//       created: created,
//       data: detail,
//     });
//     await imageData.save();
//     socket.emit("Image Saved", { id: i + 1, total: generatedImages.length });
//     const uploadedUrl = await Upload(
//       `${dir}/${generationID}/${name}_ORIGIN`,
//       originimage
//     );
//     console.log(uploadedUrl);
//   }
// };

// const saveMotion = async (username, generationID, detail, socket) => {
//   const options = {
//     method: "GET",
//     url: `https://cloud.leonardo.ai/api/rest/v1/generations/${generationID}`,
//     headers: headers,
//   };

//   let response = await axios.request(options);
//   const generatedImages = response.data.generations_by_pk.generated_images;
//   const created = response.data.generations_by_pk.createdAt;

//   let uploadedUrl;
//   {
//     const url = generatedImages[0].url;
//     const pos = url.lastIndexOf("/");
//     var name = url.substring(pos + 1);
//     name = name.replace("Leonardo", "Stark");
//     const res = await axios({
//       url,
//       method: "GET",
//       responseType: "stream",
//     });
//     const pos1 = username.lastIndexOf("@");
//     var dir = username.substring(0, pos1);
//     await Upload(`${dir}/${generationID}/${name}`, res.data);
//   }

//   {
//     const url = generatedImages[0].motionMP4URL;
//     const pos = url.lastIndexOf("/");
//     var name = url.substring(pos + 1);
//     name = name.replace("Leonardo", "Stark");
//     const res = await axios({
//       url,
//       method: "GET",
//       responseType: "stream",
//     });
//     const pos1 = username.lastIndexOf("@");
//     var dir = username.substring(0, pos1);
//     uploadedUrl = await Upload(`${dir}/${generationID}/${name}`, res.data);
//   }

//   const imageData = new Image({
//     generationID: generatedImages[0].id,
//     image: uploadedUrl,
//     owner: username,
//     created: created,
//     data: detail,
//   });
//   await imageData.save();

//   socket.emit("Motion Saved", { imageData });
// };

// const getImageUploadUrl = async () => {
//   try {
//     const url = "https://cloud.leonardo.ai/api/rest/v1/init-image";
//     const payload = { extension: "jpg" };

//     const response = await axios.post(url, payload, { headers });

//     return response.data.uploadInitImage;
//   } catch (error) {
//     console.error(error);
//   }
// };

// const uploadImage = async (uploadInitImage, imgData) => {
//   try {
//     const url = uploadInitImage.url;
//     const fields = JSON.parse(uploadInitImage.fields);
//     const formData = new FormData();

//     for (let key in fields) {
//       formData.append(key, fields[key]);
//     }

//     // formData.append("file", fs.createReadStream(imgData));
//     formData.append("file", imgData);

//     // Axios will set the Content-Type to multipart/form-data boundary automatically.
//     await axios.post(url, formData);

//     return uploadInitImage.id; // Image ID for further actions
//   } catch (error) {
//     console.error(error);
//   }
// };

// const generateImageToImage = async (imageId, options) => {
//   try {
//     const url = "https://cloud.leonardo.ai/api/rest/v1/generations";
//     const payload = {
//       ...options,
//       init_image_id: imageId,
//     };
//     const response = await axios.post(url, payload, { headers });

//     return response.data.sdGenerationJob.generationId;
//   } catch (error) {
//     console.error(error);
//   }
// };

// const handleGenerate = async (imgData, options) => {
//   const uploadInitImage = await getImageUploadUrl();

//   if (!uploadInitImage) return;

//   const imageId = await uploadImage(uploadInitImage, imgData);

//   if (!imageId) return;

//   const generationId = await generateImageToImage(imageId, options);
//   if (!generationId) return;

//   await waitForGeneration(generationId, options.num_images);

//   return generationId;
// };

io.on("connection", (socket) => {
  socket.on("text-to-image", async (data) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const wh = data.dimension.split("*");
    var raw = JSON.stringify({
      key: "LhQrQ6mWGnOVEcg6Qd4WUfwDKVszcLS0U4aslwWUJe1zBuueou6XgLqT9XRM",
      prompt: data.text,
      negative_prompt: "bad quality",
      width: wh[0],
      height: wh[1],
      safety_checker: false,
      seed: null,
      samples: 1,
      base64: false,
      webhook: null,
      track_id: null,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    await fetch(
      "https://modelslab.com/api/v6/realtime/text2img",
      requestOptions
    )
      .then((response) => response.text())
      .then(async (result) => {
        const tmp = JSON.parse(result);

        const options = {
          height: tmp.meta.height,
          modelId: data.model,
          prompt: data.text,
          width: tmp.meta.width,
          num_images: 1,
          alchemy: data.alchemy === "true" ? true : false,
          presetStyle: data.presetStyle,
          negative_prompt: data.negative_prompt,
        };

        const imageData = new Image({
          generationID: tmp.id,
          image: tmp.output[0],
          owner: data.user,
          created: new Date(),
          data: options,
        });

        // console.log(result, imageData);
        await imageData.save();
      })
      .catch((error) => console.log("error", error));
    socket.emit("Save Complete", { message: "All images saved." });
  });

  socket.on("image-to-image", async (data) => {});

  socket.on("image-to-motion", async (data) => {});

  socket.on("text-to-video", async (data) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const wh = data.dimension.split("*");
    var raw = JSON.stringify({
      key: "LhQrQ6mWGnOVEcg6Qd4WUfwDKVszcLS0U4aslwWUJe1zBuueou6XgLqT9XRM",
      model_id: "zeroscope",
      prompt: data.text,
      seconds: 5,
      negative_prompt: "low quality",
      heigh: wh[0],
      width: wh[1],
      num_frames: 16,
      num_inference_steps: 20,
      guidance_scale: 7,
      upscale_height: 1024,
      upscale_width: 1024,
      upscale_strength: 0.6,
      upscale_guidance_scale: 12,
      upscale_num_inference_steps: 20,
      output_type: "mp4",
      webhook: null,
      track_id: null,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      // url: "https://modelslab.com/api/v5/text2video",
      redirect: "follow",
    };

    await fetch("https://modelslab.com/api/v5/text2video", requestOptions)
      .then((response) => response.text())
      .then(async (result) => {
        const tmp = JSON.parse(result);
        const link = tmp.future_links[0];
        const fetch_url = tmp.fetch_result;
        {
          var options = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({
              key: "LhQrQ6mWGnOVEcg6Qd4WUfwDKVszcLS0U4aslwWUJe1zBuueou6XgLqT9XRM",
            }),
            redirect: "follow",
          };

          let fg = true;
          const wait = (ms) =>
            new Promise((resolve) => setTimeout(resolve, ms));

          while (fg) {
            await fetch(fetch_url, options)
              .then((res) => res.json())
              .then((result) => {
                if (result.status === "success") fg = false;
              });
            await wait(2000);
          }
          const imageOptions = {
            height: tmp.meta.height,
            modelId: data.model,
            prompt: data.text,
            width: tmp.meta.width,
            num_images: 1,
            alchemy: data.alchemy === "true" ? true : false,
            presetStyle: data.presetStyle,
            negative_prompt: data.negative_prompt,
          };

          const imageData = new Image({
            generationID: tmp.id,
            image: link,
            owner: data.user,
            created: new Date(),
            data: imageOptions,
          });

          // console.log(result, imageData);
          await imageData.save();
          socket.emit("Save Complete", { message: "All images saved." });
        }
      })
      .catch((error) => console.log("error", error));
  });
});

server.listen(5001, () => {
  console.log("listening on *:5001");
});

module.exports = router;
