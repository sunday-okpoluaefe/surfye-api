/**
 * Post routes
 */
const express = require('express');
const router = express.Router();
const middlewares = require('../providers/middlewares');
const { FavouriteController } = require('../providers/controllers');

router.post('/:id', middlewares.passport.authenticate, middlewares.validateRequest, middlewares.async(FavouriteController.add));
router.delete('/:id', middlewares.passport.authenticate, middlewares.validateRequest, middlewares.async(FavouriteController.delete));

module.exports.FavouriteRoutes = router;
