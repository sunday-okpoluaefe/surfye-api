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
    enum: ['video', 'image', 'finance', 'maps', 'article'],
    default: 'article'
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
  description: { type: String },
  status: {
    type: String,
    enum: ['draft', 'publish'],
    default: 'draft'
  },
  url: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  }
}, { timestamps: true });
