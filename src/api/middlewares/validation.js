const config = require('config');
const _ = require('lodash');
const Schemas = require('../providers/validations');
const validation = require('../services/validation');
const { SetErrorData } = require('../providers/helpers');

/**
 * Factory middleware function to validate Joi Schema
 * @returns {Function}
 * @param schema
 */
module.exports.validateRequestFactory = (schema) => (req, res, next) => {
  // eslint-disable-next-line no-undef
  validateSchemaRequest(schema, req, res, next);
};

/**
 * Validate request middleware
 */
module.exports.validateRequest = (req, res, next) => {
  let route = `${req.method.toLowerCase()}:${req.baseUrl.replace(config.get('api.basePath'), '')}${req.route.path}`;
  route = route.replace(/\/+$/, '');
  if (!_.has(Schemas, route)) return next();
  const schema = _.get(Schemas, route);

  // eslint-disable-next-line no-undef
  validateSchemaRequest(schema, req, res, next);
};

/**
 * Validate request schema
 */
// eslint-disable-next-line no-undef
validateSchemaRequest = (schema, req, res, next) => {
  const { error, value } = validation.validate(schema, req.body);

  if (error) {
    req.respond.badRequest(validation.parseError(error));
    return error;
  }
  req.body = value;

  next();
};

/*
 check if account exist
 */

// eslint-disable-next-line consistent-return
module.exports.validateSkip = async (req, res, next) => {
  if (req.query.skip && req.query.skip < 0) {
    return req.respond.badRequest(SetErrorData(
      {
        message: 'page/skip must be at least zero (0)',
        key: 'skip',
      },
    ));
  }

  next();
};
