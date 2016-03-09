var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var routes = require('./routes/index');
var users  = require('./routes/users');
var songs = require('./routes/songs');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  store: new RedisStore({
      host: '127.0.0.1',
      port: 6379
  }),
  path: '/',
  secret: 'abcdefghijkmnop',
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  req.logIn = function(user, cb) {
    if(!user) cb("UNAUTHPRIZED");
    else {
      req.session.user = user;
      req.user = user;
      cb();
    }
  };
  next();
});
app.use((req, res, next) => {
  req.user = req.session.user;
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
})

app.use('/', routes);
app.use('/users', users);
app.use('/songs', songs);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
