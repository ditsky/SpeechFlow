#! /usr/bin/env node

//print the version of the weblication if command line arguments are passed
if (
  process.argv[2] &&
  (process.argv[2].toLowerCase() === '-v' || process.argv[2] === '--version')
) {
  console.log('Slidex v 1.0.7');
  process.exit(0);
} else if (process.argv[2]) {
  console.log('(✖_✖) Nothing I can do about that.');
  process.exit(0);
}

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
  axios = require('axios');
// socketServer = require('http').Server(socket), // init an http server for socket.io
// io = require('socket.io')(socketServer), // not needed for now

// server.listen(process.env.PORT, function() {
//   // let the dialogflow's server listen to heroku's port
//   console.log('API server listening...');
// });

//only these keys will be activated by node-key-sender
keys = ['left', 'right', 'up', 'down', 'space', 'enter'];

// //to serve static files for client
// voice.use(express.static(path.join(__dirname, 'public')));

// //serve the html page with buttons
// voice.get('/', (req, res) => {
//   res.sendFile('public/index.html', {
//     root: __dirname
//   });
// });

var slide = 1;
var students = [
  'Sam',
  'Joseph',
  'Huaigu',
  'Marie',
  'Xuxin',
  'Arjun',
  'Casper',
  'Tim',
  'Cliffe',
  'EK',
  'Gavin',
  'Jen',
  'Jialin',
  'Jierui',
  'Kelley',
  'Luis',
  'Michael',
  'Sandy',
  'Spencer',
  'Xuantong',
  'Ziqing'
];
var selectedStudent = '';

//WEBHOOK CODE
var bodyParser = require('body-parser');

voice.use(bodyParser.json());

voice.post('/hook', attachConnection, sendCommand, function(req, res) {
  // var d = new Date();
  // var time = d.toTimeString();
  // console.log(time);
  // console.log('req.body is: ');
  // console.log(JSON.stringify(req.body, null, 5));
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
  } else if (req.body.queryResult.intent.displayName == 'nextSlide') {
    axios
      .post(res.locals.connection.ngrok + '/get', { msg: 'next' })
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
      .post(res.locals.connection.ngrok + '/get', { msg: 'random' })
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
    axios
      .post(res.locals.connection.ngrok + '/get', {
        msg: 'link',
        url: 'www.google.com'
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
      .post(res.locals.connection.ngrok + '/get', { msg: 'back' })
      .then(response => {
        console.log('on heroku sending to ngrok ');
        res.locals.output_string = 'Moving to the previous slide';
        next();
      })
      .catch(error => {
        console.log('error in previousSlide: ' + error);
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

// //Monkey patching the node-key-sender library to fix jar path issues
// keySender.execute = function(arrParams) {
//   return new Promise(function(resolve, reject) {
//     //path where the jar file resides
//     const jarPath = path.join(
//       __dirname,
//       'node_modules',
//       'node-key-sender',
//       'jar',
//       'key-sender.jar'
//     );
//     //generate command to execute the jar file
//     //original command with path in quotes replace with path without enclosed in quotes
//     const command =
//       'java -jar ' +
//       jarPath +
//       ' ' +
//       arrParams.join(' ') +
//       keySender.getCommandLineOptions();

//     return exec(command, {}, function(error, stdout, stderr) {
//       if (error == null) {
//         resolve(stdout, stderr);
//       } else {
//         reject(error, stdout, stderr);
//       }
//     });
//   });
// };

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

//init schema for user input
// const schema = {
//   properties: {
//     portNumber: {
//       description: 'Type a port number - Press Enter to start with -> ',
//       default: '8080',
//       conform: function(value) {
//         if (/^[0-9]+$/.test(value)) {
//           //check whether the requested port is in protected range.
//           if (value >= 1024 && value <= 65535) return true;
//           else {
//             schema.properties.portNumber.message =
//               'Port Number should be within (1024 - 65535) Due to root privilege requirement ';
//             return false;
//           }
//         } else {
//           schema.properties.portNumber.message =
//             'Port number should be only numbers';
//           return false;
//         }
//       }
//     }
//   }
// };

//prompt for port to run the server
// prompt.start();
// prompt.get(schema, function(err, result) {
//   //if result is undefined, ie. user tried to key combo to exit or some BS. exit the web
//   if (!result) {
//     process.exit(0);
//   }
//   //use default port, if input is invalid
//   const port = result ? result.portNumber : 8081;
// server.listen(herokuPORT, function() {
//   console.log('API server listening...');
// });
// });

module.exports = voice;
