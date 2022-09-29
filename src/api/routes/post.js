/**
 * Post routes
 */
const express = require('express');
const router = express.Router();
const middlewares = require('../providers/middlewares');
const { PostController } = require('../providers/controllers');

router.get('/random', middlewares.passport.checkAuthorization, middlewares.validateRequest, middlewares.async(PostController.random));
router.get('/search', middlewares.passport.checkAuthorization, middlewares.validateRequest, middlewares.async(PostController.search));
router.get('/me', middlewares.passport.authenticate, middlewares.validateRequest, middlewares.async(PostController.me));
router.post('/like/:post', middlewares.passport.authenticate, middlewares.validateRequest, middlewares.async(PostController.like));
router.post('/dislike/:post', middlewares.passport.authenticate, middlewares.validateRequest, middlewares.async(PostController.dislike));
router.post('/visit/:post', middlewares.validateRequest, middlewares.async(PostController.visit));
router.post('/publish/:post', middlewares.passport.authenticate, middlewares.validateRequest, middlewares.async(PostController.publishPost));
router.delete('/publish/:post', middlewares.passport.authenticate, middlewares.validateRequest, middlewares.async(PostController.unPublishPost));

router.post('/', middlewares.passport.authenticate, middlewares.validateRequest, middlewares.async(PostController.save));
router.get('/:id', middlewares.passport.authenticate, middlewares.validateRequest, middlewares.async(PostController.one));
router.put('/:id', middlewares.passport.authenticate, middlewares.validateRequest, middlewares.async(PostController.update));

module.exports.PostRoutes = router;
