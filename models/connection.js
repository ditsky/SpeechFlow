'use strict';
const mongoose = require('mongoose');

var connectionSchema = mongoose.Schema({
  userID: String,
  code: String,
  ngrok: String
});

module.exports = mongoose.model('connection', connectionSchema);
