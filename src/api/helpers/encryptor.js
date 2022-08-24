const CryptoJS = require('crypto-js');

const api = {};

api.encrypt = (data, key) => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

api.decrypt = (data, key) => {
  try{
    const bytes = CryptoJS.AES.decrypt(data, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }catch (e) {
    return null;
  }
};

module.exports.Encryptor = api;
