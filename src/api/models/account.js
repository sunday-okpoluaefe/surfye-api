const { Encryptor } = require('../helpers/encryptor');

/**
 * Account Model
 */
const { Model } = require('./model');
const auth = require('../services/auth');
const { AccountSchema } = require('../providers/schemas');

/**
 * Implement hash password in model pre save hook
 */
AccountSchema.pre('save', async function (next) {
  if (this.privateKey === undefined || this.privateKey === null) {
    this.privateKey = Encryptor.encrypt(Date.now()
      .toString() + this.email + this._id);
  }
  next();
});

/**
 * Generate JWT.
 * @returns {String}
 */
AccountSchema.methods.setAuthToken = function (params) {
  let token = auth.sign({
    anonymous: false,
    _id: this._id,
    email: this.email,
    name: this.name,
    image: this.image,
    country: this.country,
    key: this.privateKey
  }, params);

  return Encryptor.encrypt(token);
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
