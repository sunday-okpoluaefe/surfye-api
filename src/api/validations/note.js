const Joi = require('@hapi/joi');

module.exports = {
  'post:/note': Joi.object({
    title: Joi.string()
      .required(),
    status: Joi.string()
      .valid('private', 'public')
      .required(),
    body: Joi.object()
      .required(),
  }),
  'post:/note/flag/:note': Joi.object({
    reason: Joi.string()
      .required()
  }),
};
