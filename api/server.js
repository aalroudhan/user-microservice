//server.js
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const morgan = require('morgan');
const appRoot = require('app-root-path');
const defaults = require(`${appRoot}/config/defaults`)
const winston = require(`${appRoot}/config/winston`);
const router = express.Router();
const cors = require('cors');
const gateway= require(`${appRoot}/utility/gateway`);
const jwt = require(`${appRoot}/config/jwtauth`);


require('./models/db');
require('./config/passport')(passport);

const app = express();

//app.set('jwtTokenSecret', process.env.JWT_SECRET || defaults.JWT_SECRET);
app.use(morgan('combined', { stream: winston.stream }));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

app.use(passport.initialize());
const user = require(`${appRoot}/routes/user.route`);

app.use('/api/user', user);
app.use('/gw/api/:service', (req, res) => {
  let auth = jwt.auth(req,res);
  let service = req.params.service;
  if(service != 'user'){
    gateway.proxy(service, req,res);
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// [SH] Catch unauthorised errors
app.use(function (err, req, res, next) {
if (err.name === 'UnauthorizedError') {
  res.status(401);
  winston.error(`${err.status} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
  res.json({"message" : err.name + ": " + err.message});
}else{
  next(err);
}
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      winston.error(`${err.status} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
      res.json({
          message: err.message,
          error: err
      });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
      message: err.message,
      error: {}
  });
});

let port  = process.env[`${defaults.SERVICE}_APP_PORT`] || defaults.APP_PORT;

app.listen(port, () => {
    console.log(`Server is up and running on port number ${port}`);
});


// process.on('unhandledRejection', (reason, p) => {
//   winston.error(`{error: ${reason}`)
// });
// process.on('uncaughtException', function (reason, p) {
//   winston.error(`Caught exception: ${reason}`);
// });



module.exports = app;
