'use strict';
exports = require("./auth/AuthHandler").login;
exports = require("./auth/AuthHandler").register;
exports = require("./auth/VerifyToken").auth;
exports = require("./auth/AuthHandler").me;
exports = require("./user/UserHandler").getUSers;


exports.http = (request, response) => {
  response.status(200).send('Hello World!');
};

exports.event = (event, callback) => {
  callback();
};
