/**
 * Post routes
 */
const express = require('express');
const router = express.Router();
const middlewares = require('../providers/middlewares');
const { PostController } = require('../providers/controllers');

router.get('/search', middlewares.validateRequest, middlewares.async(PostController.search));
router.get('/me', middlewares.passport.authenticate, middlewares.validateRequest, middlewares.async(PostController.me));

router.post('/', middlewares.passport.authenticate, middlewares.validateRequest, middlewares.async(PostController.save));
router.get('/:id', middlewares.validateRequest, middlewares.async(PostController.one));

module.exports.PostRoutes = router;
