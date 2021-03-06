var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var favicon = require('serve-favicon');
var flash = require('connect-flash');
var logger = require('morgan');
var passport = require('passport');
var path = require('path');
var session = require('express-session');
var StormpathStrategy = require('passport-stormpath');

var index_routes = require('./routes/index');
var auth_routes = require('./routes/auth');

var app = express();
var strategy = new StormpathStrategy({
  apiKeyId: process.env['STORMPATH_API_KEY_ID'],
  apiKeySecret: process.env['STORMPATH_API_KEY_SECRET'],
  appHref: process.env['STORMPATH_APP_HREF'],
});

passport.use(strategy);
passport.serializeUser(strategy.serializeUser);
passport.deserializeUser(strategy.deserializeUser);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('strict routing', true);

app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SECRET,
  key: 'sid',
  cookie: {secure: false},
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.use('/', index_routes);
app.use('/', auth_routes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

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
