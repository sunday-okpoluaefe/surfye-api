/**
 * Category Model
 */
const {Model} = require ("./model");
const { CategorySchema } = require('../providers/schemas');

module.exports.Category = Model.create('Category', CategorySchema);
