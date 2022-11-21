/**
 * Account Model
 */
const { Model } = require('./model');
const mongoose = require('mongoose');
const { PostSchema } = require('../providers/schemas');
const joiObjectid = require('joi-objectid');

PostSchema.statics.retrieve = function (data) {
  return this.find(data.match)
    .populate('category', '_id category description')
    .populate('account', '_id name image email')
    .sort((data.sort) ? data.sort : { _id: -1 })
    .limit(parseInt(data.limit) || 10)
    .skip(parseInt(data.skip) || 0);
};

PostSchema.statics.summary = function(account) {
  return this.aggregate(
    [
    { 
        $match: { account: mongoose.Types.ObjectId(account) } 
    },
    { 
        $group: {
          _id: { 
              year: { $year: "$createdAt" }, 
              month: { $month: "$createdAt" } 
          },
          total_visits_month: { $sum: "$visits" }
      }
    },
    ]
  );
}

PostSchema.statics.total_type_aggregate = function(account) {
  return this.aggregate(
    [
    { 
        $match: { account: mongoose.Types.ObjectId(account) } 
    },
    { 
        $group: {
          _id: { type: "$type" },
          total_visits: { $sum: "$visits" },
          count: { $sum: 1 }
      }
    },
    ]
  );
}

module.exports.Post = Model.create('Post', PostSchema);
