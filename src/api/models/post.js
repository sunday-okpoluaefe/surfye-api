/**
 * Account Model
 */
const {Model} = require ("./model");
const { PostSchema } = require('../providers/schemas');

module.exports.Post = Model.create('Post', PostSchema);
