var passport = require('passport');
var mongoose = require('mongoose');
const { check } = require('express-validator');

var UserModel = mongoose.model('users');

exports.validation = [
  check('password'),
  check('email').isEmail().normalizeEmail().trim().withMessage("Invalid email")
];
exports.handler = function (req, res, next) {
  return new Promise(function (resolve, reject) {

    passport.authenticate('local', function (err, user, info) {
      console.log("ASDFASDF")
      if (err) {
        reject({ status: 503, error: err });
      } else if (user) {//found a user, password matches!
        resolve({
          response: {
            token: user.generateJwt(),
            _id: user._id
          },
        });
      }
      else {
        reject({status:401, error: "Invalid email or password" });
      }
    })(req, res,next);
  });
}