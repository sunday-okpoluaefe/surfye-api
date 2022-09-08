/**
 * Post routes
 */
const express = require('express');
const router = express.Router();
const middlewares = require('../providers/middlewares');
const { CategoryController } = require('../providers/controllers');

router.get('/', middlewares.passport.authenticate, middlewares.validateRequest, middlewares.async(CategoryController.all));
router.get('/:id', middlewares.passport.authenticate, middlewares.validateRequest, middlewares.async(CategoryController.one));

module.exports.CategoryRoutes = router;
