/**
 * Post routes
 */
const express = require('express');
const router = express.Router();
const middlewares = require('../providers/middlewares');
const { PostController } = require('../providers/controllers');

router.get('/search', middlewares.passport.checkAuthorization, middlewares.validateRequest, middlewares.async(PostController.search));
router.get('/me', middlewares.passport.authenticate, middlewares.validateRequest, middlewares.async(PostController.me));
router.post('/like/:post', middlewares.passport.authenticate, middlewares.validateRequest, middlewares.async(PostController.like));
router.post('/dislike/:post', middlewares.passport.authenticate, middlewares.validateRequest, middlewares.async(PostController.dislike));
router.post('/visits/:post', middlewares.validateRequest, middlewares.async(PostController.dislike));

router.post('/', middlewares.passport.authenticate, middlewares.validateRequest, middlewares.async(PostController.save));
router.get('/:id', middlewares.validateRequest, middlewares.async(PostController.one));

module.exports.PostRoutes = router;
