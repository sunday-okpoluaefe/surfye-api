/**
 * Account routes
 */
const express = require('express');
const router = express.Router();
const middlewares = require('../providers/middlewares');
const { AccountController } = require('../providers/controllers');

router.post('/auth', middlewares.validateRequest, middlewares.async(AccountController.auth));

module.exports.AccountRoutes = router;
