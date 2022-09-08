/**
 * Account Schema
 */
const mongoose = require('mongoose');

module.exports.AccountSchema = new mongoose.Schema({
  name: { type: String },
  image: { type: String },
  gender: {
    type: String,
    enum: ['female', 'male']
  },
  status: {
    type: String,
    enum: ['approved', 'suspended', 'pending'],
    default: 'pending'
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  complete: {
    type: Boolean,
    default: false
  },
  country: { type: String },
}, { timestamps: true });
