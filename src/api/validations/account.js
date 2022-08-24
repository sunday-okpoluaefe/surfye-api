const Joi = require('@hapi/joi');

module.exports = {
  'post:/account/auth': Joi.object({
    name: Joi.string()
      .required(),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    country: Joi.string()
      .required(),
    image: Joi.string()
      .required(),
  }),
};
