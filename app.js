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

voice.post('/hook', process_request, function(req, res) {
  var d = new Date();
  var time = d.toTimeString();
  console.log(time);
  return res.json({
    fulfillmentMessages: [],
    fulfillmentText: req.output_string,
    payload: {},
    outputContexts: [],
    source: 'Test Source',
    followupEventInput: {}
  });
});

voice.post('/users', function(req, res) {
  console.log(req.body);
  res.json({ msg: 'completed' });
});

//http request code
// const postData = querystring.stringify({
//   msg: 'next'
// });

// const options = {
//   hostname: 'b206242c.ngrok.io',
//   port: 8081,
//   path: '/get',
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/x-www-form-urlencoded',
//     'Content-Length': Buffer.byteLength(postData)
//   }
// };

// const req2 = http.request(options, res => {
//   console.log(`STATUS: ${res.statusCode}`);
//   console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
//   res.setEncoding('utf8');
//   res.on('data', chunk => {
//     console.log(`BODY: ${chunk}`);
//   });
//   res.on('end', () => {
//     console.log('No more data in response.');
//   });
// });

// req2.on('error', e => {
//   console.error(`problem with request: ${e.message}`);
// });

// req2.write(postData);
// console.dir(req2);
// req2.end();

function process_request(req, res, next) {
  var output_string = 'there was an error';
  if (req.body.queryResult.intent.displayName == 'nextSlide') {
    axios
      .post('https://b206242c.ngrok.io/get', { msg: 'next' })
      .then(response => {
        console.log('on heroku sending to ngrok ');
        res.json({ message: 'completed next' });
      });
    // var data = 'down';
    // console.log(data);
    // if (data && keys.includes(data)) {
    //   try {
    //     keySender.sendKey(data);
    //     slide++;
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
    req.output_string = 'Moving to the next slide';
  } else if (req.body.queryResult.intent.displayName == 'goToSlide') {
    var slideNum = req.body.queryResult.parameters['number-integer'];
    axios
      .post('https://b206242c.ngrok.io/get', { msg: 'goTo', num: slideNum })
      .then(response => {
        console.log('on heroku sending to ngrok ');
        res.json({ message: 'completed goTo' });
      });
    // var data = 'enter';
    // console.log(data);
    // if (data && keys.includes(data)) {
    //   try {
    //     if (slideNum < 10) {
    //       keySender.sendKeys([slideNum, data]);
    //     } else {
    //       var slideNumStr = slideNum.toString();
    //       var length = slideNumStr.length;
    //       var array = [];
    //       for (var i = 0; i < length; i++) {
    //         array.push(slideNumStr.charAt(i));
    //       }
    //       array.push(data);
    //       keySender.sendKeys(array);
    //     }
    //     slide = slideNum;
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
    req.output_string = 'Moving to slide number ' + slideNum;
  } else if (req.body.queryResult.intent.displayName == 'randomStudent') {
    axios
      .post('https://b206242c.ngrok.io/get', { msg: 'random' })
      .then(response => {
        console.log('on heroku sending to ngrok ');
        res.json({ message: 'completed random' });
      });
    // var rand = students[Math.floor(Math.random() * students.length)];
    // output_string = 'Selected ' + rand;
    // selectedStudent = rand;
    console.log(res);
    req.output_string = 'selected Marie the greatest professor in the world';
  } else if (req.body.queryResult.intent.displayName == 'goToLink') {
    axios
      .post('https://b206242c.ngrok.io/get', { msg: 'link' })
      .then(response => {
        console.log('on heroku sending to ngrok ');
        res.json({ message: 'completed link' });
      });
    // linkController.goToLink();
    req.output_string = 'opening the link';
  } else if (req.body.queryResult.intent.displayName == 'previousSlide') {
    axios
      .post('https://b206242c.ngrok.io/get', { msg: 'back' })
      .then(response => {
        console.log('on heroku sending to ngrok ');
        res.json({ message: 'completed back' });
      });
    // var data = 'up';
    // console.log(data);
    // if (data && keys.includes(data)) {
    //   try {
    //     keySender.sendKey(data);
    //     slide--;
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
    req.output_string = 'Moving to the previous slide';
  } else {
    req.output_string = 'oh noooooooooooooo';
  }
  next();
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
