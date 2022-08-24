const _ = require('lodash');
const Joi = require('@hapi/joi');

/**
 * Validate Joi schema
 * @param schema
 * @param data
 */
module.exports.validate = (schema, data) => {
    return schema.validate(data, {
        abortEarly: false, // abort after the last validation error
        allowUnknown: true, // allow unknown keys that will be ignored
        stripUnknown: true // remove unknown keys from the validated data
    });
}

/**
 * Parse Joi error object
 * @param {Object} error
 * @returns {Object}
 */
module.exports.parseError = (error) => {
    return {
        //original: error._original,
        errors: _.map(error.details, ({message, context}) => ({
            message: message.replace(/['"]/g, ''),
            key: context.key
        }))
    }
}
