const _ = require('lodash');
const mongoose = require('mongoose');
const { Pagination } = require('../helpers/pagination');

class Model {
  static create(name, schema) {
    Object.assign(schema.methods, methods);

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
    return this.toObject({ getters: true, flattenMaps: true });
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
      } else this[key] = arr[key];
    }
    return this;
  },
};

