const Joi = require('@hapi/joi');

module.exports = {
  'post:/post': Joi.object({
    title: Joi.string()
      .required(),
    status: Joi.string()
      .valid('draft', 'publish')
      .required(),
    description: Joi.string(),
    url: Joi.string()
      .required(),
    category: Joi.objectId()
      .required(),
  }),
  'put:/post/:post': Joi.object({
    title: Joi.string()
      .required(),
    status: Joi.string()
      .valid('draft', 'publish')
      .required(),
    description: Joi.string(),
    url: Joi.string()
      .required(),
    category: Joi.objectId()
      .required(),
  }),
  'post:/post/flag/:post': Joi.object({
    reason: Joi.string().required()
  }),
};
