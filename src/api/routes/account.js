/**
 * Account routes
 */
const express = require('express');
const router = express.Router();
const middlewares = require('../providers/middlewares');
const { AccountController } = require('../providers/controllers');

router.post('/auth', middlewares.validateRequest, middlewares.async(AccountController.auth));
router.put('/interest', middlewares.passport.authenticate, middlewares.validateRequest, middlewares.async(AccountController.interests));

module.exports.AccountRoutes = router;
