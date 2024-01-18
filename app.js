var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//to keep user logged in 
const expresSession = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const passport = require('passport');

var app = express();

// view engine setup to use EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//allows to stay logged in 
app.use(expresSession({
  resave: false,
  saveUninitialized: false,
  secret: "hey hey hey"
}));
//to make login, register and protected routes , it keeps us logged in 
app.use(passport.initialize());
//data remains saved
app.use(passport.session());
passport.serializeUser(usersRouter.serializeUser());
passport.deserializeUser(usersRouter.deserializeUser());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  //If the application is in development mode 
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(5000,()=>{
  console.log("Server is running at port 5000")
})

module.exports = app;