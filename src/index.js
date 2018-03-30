require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');

const routes = require('./routes');

const app = express();
const port = parseInt(process.env.PORT, 10) || 5000;

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}

const corsOptions = {
  origin: ['https://staging.chefd.com', 'https://chefd.com'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', routes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500);

  const data = {
    message: err.message,
    error: err,
  };

  res.json(data);
});

app.listen(port, () => `Server running on port ${port}`);
