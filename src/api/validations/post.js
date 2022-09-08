const Joi = require('@hapi/joi');

module.exports = {
  'post:/post': Joi.object({
    title: Joi.string()
      .required(),
    type: Joi.string()
      .valid('video', 'image', 'finance', 'maps', 'article')
      .required(),
    status: Joi.string()
      .valid('draft', 'publish')
      .required(),
    description: Joi.string()
      .required(),
    url: Joi.string()
      .required(),
    category: Joi.objectId().required(),
  }),
};
