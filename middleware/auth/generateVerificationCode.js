const crypto = require("crypto");

function generateVerificationCodeWithExpiry(
  length = 6,
  expiryDuration = 600000
) {
  // default 10 minutes
  const verificationCode = crypto
    .randomBytes(length)
    .toString("hex")
    .slice(0, length);
  const expiryTime = Date.now() + expiryDuration;
  return { verificationCode, expiryTime };
}

module.exports = generateVerificationCodeWithExpiry;
