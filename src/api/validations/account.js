const Joi = require('@hapi/joi');

module.exports = {
  'post:/account/auth': Joi.object({
    name: Joi.string()
      .required(),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    image: Joi.string()
      .required()
  }),
  'put:/account/interest': Joi.object({
    'interests': Joi.array().items(Joi.objectId()).required(),
  })
};
