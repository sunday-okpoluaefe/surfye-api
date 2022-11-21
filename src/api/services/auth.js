/**
 * Authentication service
 */

const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET_KEY;

module.exports.password = () => {
  let length = 12,
    charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    retVal = '';
  let i = 0,
    n = charset.length;
  for (; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

/**
 * JWT Sign data
 * @param {Object} data
 * @param params
 * @returns {String}
 */
module.exports.sign = (data, params) => {
  const options = {
    expiresIn: '24h'
  };

  if (params && params.persist) delete options.expiresIn;

  return jwt.sign(data, secret, options);
};

/**
 * Verify and decode JWT token
 * @param {String} token
 * @returns {Object}
 */
module.exports.verify = (token) => {
  try {
    const decoded = jwt.verify(token, secret);
    return { decoded: decoded };
  } catch (error) {
    return { error: error };
  }
};
