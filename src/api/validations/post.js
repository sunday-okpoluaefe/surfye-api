const Joi = require('@hapi/joi');

module.exports = {
  'post:/post': Joi.object({
    title: Joi.string()
      .required(),
    status: Joi.string()
      .valid('private', 'public')
      .required(),
    description: Joi.string(),
    url: Joi.string().uri()
      .required(),
    category: Joi.objectId()
      .required(),
  }),
  'put:/post/:post': Joi.object({
    title: Joi.string()
      .required(),
    status: Joi.string()
      .valid('private', 'public')
      .required(),
    description: Joi.string(),
    url: Joi.string().uri()
      .required(),
    category: Joi.objectId()
      .required(),
  }),
  'post:/post/flag/:post': Joi.object({
    reason: Joi.string().required()
  }),
  'post:/post/note': Joi.object({
    title: Joi.string()
      .required(),
    color: Joi.string()
      .required(),
    status: Joi.string()
      .valid('private', 'public')
      .required(),
    body: Joi.string()
      .required(),
    raw: Joi.string()
      .required(),
  }),
  'put:/post/note/:id': Joi.object({
    title: Joi.string()
      .required(),
    color: Joi.string()
      .required(),
    status: Joi.string()
      .valid('private', 'public')
      .required(),
    body: Joi.string()
      .required(),
    raw: Joi.string()
      .required(),
  })
};
