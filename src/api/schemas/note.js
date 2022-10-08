/**
 * Account Schema
 */
const mongoose = require('mongoose');

module.exports.NoteSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    ref: 'Account'
  },
  title: { type: String },
  visits: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  flagged: {
    type: Number,
    default: 0
  },
  type: {
    type: String,
    enum: ['note'],
    default: 'note'
  },
  status: {
    type: String,
    enum: ['private', 'public'],
    default: 'private'
  },
  body: { type: Object },
}, { timestamps: true });
