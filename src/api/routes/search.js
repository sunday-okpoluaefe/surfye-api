/**
 * Post routes
 */
const express = require('express');
const router = express.Router();
const middlewares = require('../providers/middlewares');
const { SearchController } = require('../providers/controllers');

router.get('/', middlewares.passport.checkAuthorization, middlewares.validateRequest, middlewares.async(SearchController.search));

module.exports.SearchRoutes = router;
