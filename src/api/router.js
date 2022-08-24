/**
 * Router
 */

const express = require('express');

const app = express();

const {
  AccountRoutes,
  PostRoutes,
  FavouriteRoutes
} = require('./providers/routes');

app.use('/account', AccountRoutes);
app.use('/post', PostRoutes);
app.use('/favourite', FavouriteRoutes);

module.exports = app;
