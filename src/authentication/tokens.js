/*
This file holds the auth function for jwt
*/
const jwt = require('express-jwt');
const mainConfig = require('../../config/main-app-config');

module.exports = jwt({
  secret: mainConfig.jwt.secret,
  userProperty: 'credentials'
});