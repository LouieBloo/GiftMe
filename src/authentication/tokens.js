/*
This file holds the auth function for jwt
*/
const jwt = require('express-jwt');
const mainConfig = require('../../config/main-app-config');

module.exports = jwt({
  secret: mainConfig.jwt.secret,
  algorithms: ['HS256'],
  userProperty: 'credentials'
});

module.exports.open = jwt({
  secret: mainConfig.jwt.secret,
  algorithms: ['HS256'],
  credentialsRequired:false,
  userProperty: 'credentials'
});

//This is ultra jank but works for the time being, swallowing the jwt error
//https://github.com/auth0/express-jwt/issues/194
module.exports.openPass = function(err,req,res,next){
  next();
} 
