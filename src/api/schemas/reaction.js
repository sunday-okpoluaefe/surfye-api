/**
 * Reaction Schema
 */
const mongoose = require('mongoose');

module.exports.ReactionSchema = new mongoose.Schema({
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
  liked: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });
