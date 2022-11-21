/**
 * Account routes
 */
const express = require('express');
const router = express.Router();
const middlewares = require('../providers/middlewares');
const { AccountController } = require('../providers/controllers');

router.post('/auth', middlewares.validateRequest, middlewares.async(AccountController.auth));
router.put('/interest', middlewares.passport.authenticate, middlewares.validateRequest, middlewares.async(AccountController.interests));
router.get('/summary', middlewares.passport.authenticate, middlewares.validateRequest, middlewares.async(AccountController.summary));

module.exports.AccountRoutes = router;
