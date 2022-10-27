/**
 * Account Schema
 */
const mongoose = require('mongoose');

module.exports.PostSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    ref: 'Account'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    ref: 'Category'
  },
  title: { type: String },
  type: {
    type: String,
    enum: ['post', 'note'],
    default: 'post'
  },
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
  description: { type: String },
  status: {
    type: String,
    enum: ['private', 'public'],
    default: 'private'
  },
  color: { type: String },
  url: {
    type: String,
    trim: true,
    lowercase: true
  },
  graph: { type: Object },
  body: { type: String },
  raw: { type: String },
}, { timestamps: true });
