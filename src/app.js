require('dotenv')
  .config();
const config = require('config');
const cron = require('node-cron');
const express = require('express');
const path = require('path');
const swaggerUI = require('swagger-ui-express');
const yaml = require('yamljs');
const redoc = require('redoc-express');
const cors = require('cors');
const fs = require('fs');

const swaggerDocs = yaml.load('./docs.yaml');

const app = express();

app.use(cors());
const http = require('http')
  .createServer(app);

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// configure port
const port = process.env.PORT;

// ==================================================
// Setting up Cross Origin Resource Sharing
// ==================================================
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Authorization, Content-Type, Accept, X-Auth-Token');
  next();
});

// app.all('/*', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
// });

const middlewares = require('./api/providers/middlewares');

// attach respond helper
app.use(middlewares.respond);
const router = require('./api/router');

// serve your swagger.json file
app.get('/readme/swagger.json', (req, res) => {
  res.sendFile('./docs.yaml', { root: '.' });
});

// define title and specUrl location
// serve redoc
app.get(
  '/readme',
  redoc({
    title: 'Instant Energy API Documentation v3.0',
    specUrl: '/readme/swagger.json'
  })
);

require('./config/database')();
// Connect to DB
app.set('trust proxy', true);

app.use(express.json()); // attach the express json middleware
app.use(config.get('api.basePath'), router); // attach API router
app.set('trust proxy', true);

app.use(middlewares.error.catch); // attach error middleware to catch internal server errors
app.use(middlewares.error.notFound); // attach error middleware to catch 404 errors

http.listen(port, () => {

});

// cron job delete log files every hour
cron.schedule('0 0 * * * *', () => {
  fs.access('./error.log', fs.constants.R_OK | fs.constants.W_OK, (err) => {
    if (!err) {
      fs.unlink('./error.log', function (err) {
      });
    }
  });

  fs.access('./combined.log', fs.constants.R_OK | fs.constants.W_OK, (err) => {
    if (!err) {
      fs.unlink('./combined.log', function (err) {
      });
    }
  });
});

module.exports = app;
