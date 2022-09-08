const {
  Category
} = require('../providers/models');

const controller = {};

controller.create = async (req, res, next) => {

};

controller.one = async (req, res, next) => {
  let category = await Category.findById(req.params.id);
  if (!category) return req.respond.notFound();
  return req.respond.ok(category);
};

controller.all = async (req, res, next) => {
  let categories = await Category.find();
  return req.respond.ok(categories);
};

module.exports.CategoryController = controller;
