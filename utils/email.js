const EMAIL_API_KEY = process.env.EMAIL_API_KEY;
const EMAIL_SECRET_KEY = process.env.EMAIL_SECRET_KEY;
const senderEmail = "dev2024@starkmeta.io";

const mailjet = require("node-mailjet").apiConnect(
  EMAIL_API_KEY,
  EMAIL_SECRET_KEY
);

const sendEmail = async (email, subject, content) => {
  try {
    const request = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: senderEmail,
            Name: "StarkMeta AI",
          },
          To: [
            {
              Email: email,
            },
          ],
          Subject: subject,
          HTMLPart: content,
        },
      ],
    });

    return request.response.status;
  } catch (error) {
    return error;
  }
};

module.exports = {
  sendEmail,
};
