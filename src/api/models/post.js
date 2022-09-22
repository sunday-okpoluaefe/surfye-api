/**
 * Account Model
 */
const {Model} = require ("./model");
const { PostSchema } = require('../providers/schemas');

PostSchema.statics.retrieve = function (data) {
  return this.find(data.match)
    .populate('category', '_id category description')
    .populate('account', '_id name image email')
    .sort({ _id: -1 })
    .limit(parseInt(data.limit) || 10)
    .skip(parseInt(data.skip) || 0);
};

module.exports.Post = Model.create('Post', PostSchema);
