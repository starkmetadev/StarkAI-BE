const AWS = require("aws-sdk");
const sharp = require("sharp");

// Set the region and access keys
AWS.config.update({
  region: process.env.BUCKET_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const Upload = async (filename, filedata) => {
  // Create a new instance of the S3 class
  const s3 = new AWS.S3();
  // Set the parameters for the file you want to upload
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: filename,
    // Body: fs.createReadStream("./data/lion.png"),
    ContentType: filename.includes(".mp4") ? "video/mp4" : "image/jpeg",
    ACL: "public-read",
    Body: filedata,
  };

  // Upload the file to S3
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        console.log("Error uploading file:", err);
        reject(err);
      } else {
        resolve(data.Location.replace("https://starkmeta-assets.s3.us-east-2.amazonaws.com/", "https://d2zitdfpdrkol8.cloudfront.net/"));
      }
    });
  });
};

module.exports = Upload;
