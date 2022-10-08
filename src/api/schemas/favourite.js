/**
 * Account Schema
 */
const mongoose = require('mongoose');

module.exports.FavouriteSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    ref: 'Account'
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    ref: 'Post'
  },
  deleted: {
    type: Boolean,
    default: false
  },
  type: { type: String }
}, { timestamps: true });
