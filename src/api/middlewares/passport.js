const auth = require('../services/auth');
const {
  Account,
  Admin
} = require('../providers/models');

const key = process.env.APP_ENC_KEY;

const encryptor = require('simple-encryptor')(key);

const passport = {};

/**
 * Middleware function to authenticate bearer tokens
 */
// eslint-disable-next-line consistent-return
passport.authenticate = async (req, res, next) => {
  if (!req.headers.authorization) return req.respond.unauthorized();

  const { authorization } = req.headers;
  const decrypted = encryptor.decrypt(authorization.substring(7));

  const token = passport.isAuthenticated(decrypted);

  if (!token) return req.respond.unauthorized();

  req.token = token;

  next();
};

/**
 * Middleware function to authenticate bearer tokens
 */
// eslint-disable-next-line consistent-return
passport.checkAuthorization = async (req, res, next) => {
  if (!req.headers.authorization) {
    next();
    return;
  }

  const { authorization } = req.headers;
  const decrypted = encryptor.decrypt(authorization.substring(7));

  const token = passport.isAuthenticated(decrypted);

  if (token) {
    req.token = token;
  }

  next();
};

passport.isAuthenticated = function (token) {
  const verify = auth.verify(token);
  if (verify.error) return false;

  return verify.decoded;
};

/**
 * Middleware function to authorise roles
 */
// eslint-disable-next-line consistent-return
passport.authorize = (role) => async (req, res, next) => {
  // eslint-disable-next-line no-underscore-dangle
  if (!req.token || !req.token._id) return req.respond.unauthorized();

  // eslint-disable-next-line no-underscore-dangle
  const account = role === 'admin' ? await Admin.findById(req.token._id) : await Account.findById(req.token._id);
  if (!account) return req.respond.unauthorized();

  if (!account.authorise(role)) return req.respond.forbidden();

  req.account = account;
  next();
};

module.exports.passport = passport;
