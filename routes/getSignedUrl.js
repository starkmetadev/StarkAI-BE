const express = require("express");
const router = express.Router();
const cfsign = require('aws-cloudfront-sign');

router.post("/", async (req, res) => {
  const url=req.body.url;
  try {
    var signingParams = {
      keypairId: process.env.CDN_KEYPAIR_ID,
      privateKeyString: process.env.CDN_PRIVATE_KEY,
      // Optional - this can be used as an alternative to privateKeyString
      // privateKeyPath: '/path/to/private/key',
    }
    
    // Generating a signed URL
    var signedUrl = cfsign.getSignedUrl(
      url, 
      signingParams
    );
    res.json(signedUrl);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Fail" });
  }
});

module.exports = router;
