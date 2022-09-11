/**
 * Account Model
 */
const {Model} = require ("./model");
const { ReactionSchema } = require('../providers/schemas');

module.exports.Reaction = Model.create('Reaction', ReactionSchema);
