var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');




// var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var chatsRouter = require('./routes/chats');



var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const session = require('express-session');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false 
    }
  }));







app.use('/users', usersRouter);
app.use('/chats', chatsRouter);

    




module.exports = app;


