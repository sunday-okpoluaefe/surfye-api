/**
 * Account Model
 */
const { Model } = require('./model');
const auth = require('../services/auth');
const bcrypt = require('bcrypt');
const { AccountSchema } = require('../providers/schemas');

const key = process.env.APP_ENC_KEY;

const encryptor = require('simple-encryptor')(key);

/**
 * Implement hash password in model pre save hook
 */
AccountSchema.pre('save', async function (next) {
  next();
});

/**
 * Validate hash
 * @param {String} hash
 * @param {String} value
 * @returns {Boolean}
 */
AccountSchema.methods.validateHash = async function (hash, value) {
  //const hash = this.get(key)
  if (!hash) return false;
  return await bcrypt.compare(value, hash);
};

/**
 * Generate JWT.
 * @returns {String}
 */
AccountSchema.methods.setAuthToken = function (params) {
  // ioredis supports all Redis commands:
  let token = auth.sign({
    anonymous: false,
    _id: this._id,
    email: this.email,
    name: this.name,
    roles: this.roles
  }, params);

  return encryptor.encrypt(token);
};

/** 5f02da96c1e582b95f067d59
 * Authorise account role
 * @param {String} role
 * @returns {Boolean}
 */
AccountSchema.methods.authorise = function (role) {
  return this.roles[role].role;
};

module.exports.Account = Model.create('Account', AccountSchema);
