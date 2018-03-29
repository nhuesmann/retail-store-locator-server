require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const logger = require('morgan');

const routes = require('./routes');

const app = express();
const port = parseInt(process.env.PORT, 10) || 5000;

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', routes);

app.get('/test', (req, res) => {
  const testPayload = [
    { id: 1, message: 'Hello, world!' },
    {
      id: 2,
      message: 'If you are seeing this, it means everything is working!',
    },
    { id: 3, message: 'I hope this saves you some time :)' },
  ];

  res.json(testPayload);
});

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
