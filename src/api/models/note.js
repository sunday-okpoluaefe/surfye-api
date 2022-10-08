/**
 * Account Model
 */
const {Model} = require ("./model");
const { NoteSchema } = require('../providers/schemas');

NoteSchema.statics.retrieve = function (data) {
  return this.find(data.match)
    .populate('account', '_id name image email')
    .sort({ _id: -1 })
    .limit(parseInt(data.limit) || 10)
    .skip(parseInt(data.skip) || 0);
};

module.exports.Note = Model.create('Note', NoteSchema);
