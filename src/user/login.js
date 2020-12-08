var passport = require('passport');
const { check } = require('express-validator');

exports.validation = [
  check('password'),
  check('email').isEmail().normalizeEmail().trim().withMessage("Invalid email")
];
exports.handler = function (req, res, next) {
  return new Promise(function (resolve, reject) {

    passport.authenticate('local', function (err, user, info) {
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
        reject({status:401, error: {
          error: {
            password: {
              msg: "Invalid password",
              param: "password",
              location: "body"
            }
          }
        } });
      }
    })(req, res,next);
  });
}