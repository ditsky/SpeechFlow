#! /usr/bin/env node

const express = require('express'),
  keySender = require('node-key-sender'),
  ip = require('ip'),
  qrcode = require('qrcode-terminal'),
  prompt = require('prompt'),
  path = require('path'),
  exec = require('child_process').exec,
  voice = express(), //initialize an express server for gui
  // socket = express(), //initialize an express server for socket.io
  // server = require('http').Server(voice), // init an http server for dialogflow
  querystring = require('querystring'),
  http = require('http'),
  axios = require('axios'),
  cookieParser = require('cookie-parser'),
  createError = require('http-errors'),
  // socketServer = require('http').Server(voice), // init an http server for socket.io
  // io = require('socket.io')(socketServer),
  logger = require('morgan');

//WEBHOOK CODE
var bodyParser = require('body-parser');

voice.use(bodyParser.json());

voice.post('/hook', attachConnection, sendCommand, function(req, res) {
  res.json({
    fulfillmentMessages: [],
    fulfillmentText: res.locals.output_string,
    payload: {},
    outputContexts: [],
    source: 'Test Source',
    followupEventInput: {}
  });
});

voice.post('/users', function(req, res) {
  console.log('the user code is: ' + req.body.code);
  console.log('the ngrok id is: ' + req.body.ngrok);
  updateNgrok(req.body.code, req.body.ngrok);
  res.json({ msg: 'ngrok updated' });
});

//Connect to Mlab database
const mongoose = require('mongoose');
// const auth = require('./config/auth');
mongoose.connect(
  'mongodb://' +
  process.env.mlab_dbuser + //Also stored in heroku config vars, use process.env.mlab_dbuser
  ':' +
  process.env.mlab_dbpassword + //Also stored in heroku config vars, use process.env.mlab_dbpassword
    '@ds113680.mlab.com:13680/heroku_t46zp7gq'
);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('we are connected!');
});

//mlab functions
const Connection = require('./models/connection');
//new code functions
function newCode() {
  const val = Math.round(10000000 * Math.random());
  return val;
}

//recieving ngrok from laptop
function updateNgrok(code, ngrok) {
  Connection.update({ code: code }, { $set: { ngrok: ngrok } })
    .then(console.log('in updateNgrok: updated ngrok'))
    .catch(error => {
      console.log('error in updateNgrok: ' + error);
    });
}

// //recieving userID from phone
// function updateUser(req, res, next) {
//   Connection.update({ code: code }, { $set: { userID: userID } })
//     .then(next())
//     .catch(error);
// }

function createUser(userID) {
  const code = newCode();
  //res.json(code)
  let newConnection = new Connection({
    code: code,
    ngrok: null,
    userID: userID
  });
  return newConnection;
}

//send command to laptop
function sendCommand(req, res, next) {
  if (req.body.queryResult.intent.displayName == 'connect') {
    res.locals.output_string =
      'please enter code: ' + res.locals.connection.code;
    next();
  } else if (req.body.queryResult.intent.displayName == 'endPresentation') {
    axios
      .post(res.locals.connection.ngrok + '/get', {
        msg: 'end'
      })
      .then(response => {
        console.log('on heroku sending to ngrok ');
        res.locals.output_string = 'OK';
        next();
      })
      .catch(error => {
        console.log('error in nextSlide: ' + error);
      });
  } else if (req.body.queryResult.intent.displayName == 'nextSlide') {
    axios
      .post(res.locals.connection.ngrok + '/get', {
        msg: 'next'
      })
      .then(response => {
        console.log('on heroku sending to ngrok ');
        res.locals.output_string = 'Moving to the next slide';
        next();
      })
      .catch(error => {
        console.log('error in nextSlide: ' + error);
      });
  } else if (req.body.queryResult.intent.displayName == 'goToSlide') {
    var slideNum = req.body.queryResult.parameters['number-integer'];
    axios
      .post(res.locals.connection.ngrok + '/get', {
        msg: 'goTo',
        num: slideNum
      })
      .then(response => {
        console.log('on heroku sending to ngrok ');
        res.locals.output_string = 'Moving to slide number ' + slideNum;
        next();
      })
      .catch(error => {
        console.log('error in goToSlide: ' + error);
      });
  } else if (req.body.queryResult.intent.displayName == 'randomStudent') {
    axios
      .post(res.locals.connection.ngrok + '/get', {
        msg: 'random'
      })
      .then(response => {
        console.log('on heroku sending to ngrok ');
        console.log('randomStudent response.data.msg: ' + response.data.msg);
        res.locals.output_string = 'selected ' + response.data.msg;
        next();
      })
      .catch(error => {
        console.log('error in randonStudent: ' + error);
      });
  } else if (req.body.queryResult.intent.displayName == 'goToLink') {
    var queryText = req.body.queryResult.queryText;
    var queryArr = queryText.split(' ');
    var n = queryArr.indexOf('link');
    var linkName = queryArr[n - 1];
    linkName = linkName.toLowerCase();
    console.log('THE LINK NAME IS: ' + linkName);
    axios
      .post(res.locals.connection.ngrok + '/get', {
        msg: 'link',
        name: linkName
      })
      .then(response => {
        console.log('on heroku sending to ngrok, change goToLink Later');
        res.locals.output_string = 'opening the link';
        next();
      })
      .catch(error => {
        console.log('error in goToLink: ' + error);
      });
  } else if (req.body.queryResult.intent.displayName == 'previousSlide') {
    axios
      .post(res.locals.connection.ngrok + '/get', {
        msg: 'back'
      })
      .then(response => {
        console.log('on heroku sending to ngrok ');
        res.locals.output_string = 'Moving to the previous slide';
        next();
      })
      .catch(error => {
        console.log('error in previousSlide: ' + error);
      });
  } else if (req.body.queryResult.intent.displayName == 'pause') {
    axios
      .post(res.locals.connection.ngrok + '/get', { msg: 'space' })
      .then(response => {
        console.log('on heroku sending to ngrok ');
        res.locals.output_string = 'OK';
        next();
      })
      .catch(error => {
        console.log('error in pause: ' + error);
      });
  } else if (req.body.queryResult.intent.displayName == 'play') {
    axios
      .post(res.locals.connection.ngrok + '/get', {
        msg: 'space'
      })
      .then(response => {
        console.log('on heroku sending to ngrok ');
        res.locals.output_string = 'OK';
        next();
      })
      .catch(error => {
        console.log('error in play: ' + error);
      });
  } else if (req.body.queryResult.intent.displayName == 'openPowerPoint') {
    axios
      .post(res.locals.connection.ngrok + '/get', { msg: 'ppt' })
      .then(response => {
        console.log('On Heroku openPowerPoint, came back from ngrok');
        res.locals.output_string = 'OK';
        next();
      })
      .catch(error => {
        console.log('error in openPowerPoint: ' + error);
      });
  } else if (req.body.queryResult.intent.displayName == 'openVideo') {
    axios
      .post(res.locals.connection.ngrok + '/get', { msg: 'video' })
      .then(response => {
        console.log('On Heroku openVideo, came back from ngrok');
        res.locals.output_string = 'OK';
        next();
      })
      .catch(error => {
        console.log('error in openVideo: ' + error);
      });
  } else {
    res.locals.output_string = 'oh noooooooooooooo';
    next();
  }
}

//find ngrok code
function attachConnection(req, res, next) {
  Connection.find({
    userID: req.body.originalDetectIntentRequest.payload.user.userId
  })
    .exec()
    .then(connection => {
      if (connection.length == 0) {
        let newConnection = createUser(
          req.body.originalDetectIntentRequest.payload.user.userId
        );
        console.log('attachConnection newConnection: ' + newConnection);
        newConnection
          .save()
          .then(() => {
            res.locals.connection = newConnection;
            next();
          })
          .catch(error => {
            console.log(
              'error in attachConnection, save newConnection: ' + error
            );
          });
      } else {
        res.locals.connection = connection[0];
        console.log('attachConnection connection attached: ' + connection[0]);
        next();
      }
    })
    .catch(error => {
      console.log('error in attachConnection: ' + error);
    });
}

//WEBHOOK CODE ENDS

// //on new connection to socket.io
// io.on('connection', function(socket) {
//   socket.emit('status', 200); //send initial status code
//   //get button click event and fire robot keyTap
//   socket.on('key', async function(data) {
//     console.log(data);
//     if (data && keys.includes(data)) {
//       try {
//         await keySender.sendKey(data);
//       } catch (error) {
//         console.log(error);
//       }
//     }
//   });
// });

// view engine setup
voice.set('views', path.join(__dirname, 'views'));
voice.set('view engine', 'pug');

voice.use(logger('dev'));
voice.use(express.json());
voice.use(express.urlencoded({ extended: false }));
voice.use(cookieParser());
voice.use(express.static(path.join(__dirname, 'public')));

var indexRouter = require('./routes/index');
voice.use('/', indexRouter);

// catch 404 and forward to error handler
voice.use(function(req, res, next) {
  next(createError(404));
});

// error handler
voice.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = voice;

// module.exports = voice;
