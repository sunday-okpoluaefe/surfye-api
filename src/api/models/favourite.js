/**
 * Account Model
 */
const { Model } = require('./model');
const { FavouriteSchema } = require('../providers/schemas');

FavouriteSchema.statics.retrieve = function (data) {
  return this.find(data.match)
    .populate('account', '_id name image')
    .populate({
      path: 'post',
      populate: [{
        path: 'category',
        model: 'Category'
      }, {
        path: 'account',
        model: 'Account',
        select: '_id name image'
      }],
    })
    .sort((data.sort) ? data.sort : { _id: -1 })
    .limit(parseInt(data.limit) || 10)
    .skip(parseInt(data.skip) || 0);
}
;

module.exports.Favourite = Model.create('Favourite', FavouriteSchema);
