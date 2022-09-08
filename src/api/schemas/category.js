/**
 * Category Schema
 */
const mongoose = require('mongoose');

module.exports.CategorySchema = new mongoose.Schema({
  category: { type: String, },
  description: { type: String }
}, { timestamps: true });
