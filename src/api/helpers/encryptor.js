const enc = require('crypto-js');
const key = process.env.APP_ENC_KEY;

const api = {};

api.encrypt = (data) => {
  return enc.AES.encrypt(data, key)
    .toString();
};

api.encryptObject = (data) => {
  return enc.AES.encrypt(JSON.stringify(data), key)
    .toString();
};

api.decrypt = (data) => {
  try {
    const bytes = enc.AES.decrypt(data, key);
    return bytes.toString(enc.enc.Utf8);
  } catch (e) {
    return null;
  }
};

api.decryptObject = (data) => {
  try {
    const bytes = enc.AES.decrypt(data, key);
    return JSON.parse(bytes.toString(enc.enc.Utf8));
  } catch (e) {
    return null;
  }
};

module.exports.Encryptor = api;
