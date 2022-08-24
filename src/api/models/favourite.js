/**
 * Account Model
 */
const {Model} = require ("./model");
const { FavouriteSchema } = require('../providers/schemas');

module.exports.Favourite = Model.create('Favourite', FavouriteSchema);
