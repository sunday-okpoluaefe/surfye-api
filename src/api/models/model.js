const _ = require('lodash');
const mongoose = require('mongoose');
const { Pagination } = require('../helpers/pagination');

class Model {
  static create(name, schema) {
    Object.assign(schema.methods, methods);
    Object.assign(schema.statics, statics)

    return mongoose.model(name, schema);
  }
}

module.exports.Model = Model;

/**
 * Helper methods for mongoose models
 */
const methods = {
  /**
   * Select keys from object
   * @param {Array} select
   * @returns {Object}
   */
  pick(...select) {
    return _.pick(this.getLean(), select);
  },

  /**
   * Omit keys from object
   * @param {Array} select
   * @returns {Object}
   */
  omit(...select) {
    return _.omit(this.getLean(), select);
  },

  getLean() {
    return this.toObject({
      getters: true,
      flattenMaps: true
    });
  },

  /**
   * Update values of model
   * @param {Array} arr
   * @returns {Model}
   */
  patch(arr) {
    for (const key in arr) {
      if (Array.isArray(this[key])) {
        if (Array.isArray(arr[key])) {
          this[key] = arr[key];
        } else {
          this[key].push(...arr[key]);
        }
      } else {
        this[key] = arr[key];
      }
    }
    return this;
  },
};

/**
 * Static helper methods for mongoose models
 */
const statics = {
  /**
   * Find By Id
   * @param {*} id
   * @param preserveNull
   */
  async retrieveById(id) {
    // retrieve one by id
    const results = await this.retrieve({ match: { _id: mongoose.Types.ObjectId(id) } });
    if (!Array.isArray(results) || results.length !== 1) return null;
    return results[0];
  },

  /**
   * Find One
   * @param {Object} match
   * @param preserveNull
   * @returns {Object}
   */
  // eslint-disable-next-line no-unused-vars
  async retrieveOne(match, preserveNull) {
    // retrieve one
    const results = await this.retrieve({ match });
    if (!Array.isArray(results) || results.length < 1) return null;
    return results[0];
  },

  /**
   * Mongoose objectId
   * @param {String} id
   * @returns {ObjectId}
   */
  objectId(id) {
    return mongoose.Types.ObjectId(id);
  },
};


