const crypto = require("crypto-js");

const decryptData = (encryptedText) => {
  const decryptedBytes = crypto.AES.decrypt(
    encryptedText,
    process.env.SECRET_KEY
  );
  const decryptedText = decryptedBytes.toString(crypto.enc.Utf8);
  const value = decryptedText.split("#");
  const realValue = value.slice(0, value.length - 1).join("");
  return realValue;
};

module.exports = decryptData;
