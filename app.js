var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var socketio = require('socket.io');
var passportLocalMongoose = require('passport-local-mongoose');
var URI = process.env.MONGOLAB_URI || 'mongodb://localhost/MyDatabase';
mongoose.connect('mongodb://heroku_lm8gfk6w:80jmu2o7njrq4931qftm6ve2cd@ds031477.mongolab.com:31477/heroku_lm8gfk6w');

var app = express();
var io = socketio();

app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
var sessionMiddleware = session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
});
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

var Schema = mongoose.Schema;


var UserDetail = new Schema({
  username: String,
  password: String
});

UserDetail.plugin(passportLocalMongoose);

var UserDetails = mongoose.model('userInfo', UserDetail);

passport.use(new LocalStrategy(UserDetails.authenticate()));
passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

var globalVar = {};
globalVar.usernames = [];
var maxUserNum = 20;

io.use(function(socket, next){
  sessionMiddleware(socket.request, {}, next);
});

io.on('connection', function(socket) {
  if (socket.request.session) {
    if (globalVar.usernames.length < maxUserNum) {
      if (globalVar.usernames.indexOf(socket.request.session.passport.user) === -1) {
        globalVar.usernames.push(socket.request.session.passport.user);
        io.emit('update board usernames', globalVar.usernames);
      }
    } else {
      socket.emit('connection fail', 'max user number reached');
      socket.disconnect();
    }
  }

  /* socket.request.session.passport.user */
  socket.on('chat message', function(msg){
    io.emit('chat message', socket.id + "," + msg);
  });

  socket.on('disconnect', function () {
    var index = globalVar.usernames.indexOf(socket.username);
    if (index >= 0) {
      globalVar.usernames.splice(index, 1);
    }
    io.emit('update board usernames', globalVar.usernames);
  });
});

app.get('/', function(req, res, next) {
  if (req.user) {
    res.render('index', { title: '2-Person Chat App' });
  } else {
    res.render('front', { title: 'Front Page' });
  }
});

app.post('/login', passport.authenticate('local'), function(req, res) {
  res.redirect('/');
});

app.post('/signup', function(req, res) {
  UserDetails.register(new UserDetails({ username : req.body.username }), req.body.password, function(err) {
    if (err) return res.send('account already exist');
    passport.authenticate('local')(req, res, function () {
      res.redirect('/');
    });
  });
});















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
