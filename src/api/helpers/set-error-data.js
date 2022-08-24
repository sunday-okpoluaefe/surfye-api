const _ = require('lodash');

/**
 * Parse error like Joi
 * @param {Object} errors
 * @returns {Object}
 */
module.exports.SetErrorData = (...errors) => {
    return { errors };
}

