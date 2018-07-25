'use strict';
const mongoose = require('mongoose');

var sfUsersSchema = mongoose.Schema({
  userID: String,
  code: String,
  ngrokURL: String
});

module.exports = mongoose.model('sfUsers', sfUsersSchema);
