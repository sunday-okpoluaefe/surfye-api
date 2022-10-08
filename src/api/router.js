/**
 * Router
 */

const express = require('express');

const app = express();

const {
  AccountRoutes,
  PostRoutes,
  FavouriteRoutes,
  CategoryRoutes,
  SearchRoutes
} = require('./providers/routes');

app.use('/account', AccountRoutes);
app.use('/search', SearchRoutes);
app.use('/category', CategoryRoutes);
app.use('/post', PostRoutes);
app.use('/favourite', FavouriteRoutes);

module.exports = app;
