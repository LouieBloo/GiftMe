var mongoose = require('mongoose');
var UserModel = mongoose.model('users');

const { check } = require('express-validator');

const userLogin = require('./login');

module.exports.validation = [
  check('name').trim().isLength({ min: 2, max: 60 }).withMessage("Name must be 2-60 characters long"),
  check('email').trim().isEmail().normalizeEmail().withMessage("Valid email required"),
  check('password').trim().isLength({ min: 8, max: 36 }).withMessage("Password must be 8-36 characters long")
];
module.exports.handler = async (req, res, next) => {

  //make sure this email isn't taken
  await checkIfEmailExists(req.validParams.email);

  var newUser = new UserModel();
  newUser.name = req.validParams.name.toLowerCase();
  newUser.email = req.validParams.email;
  newUser.setPassword(req.validParams.password);

  //save the user
  await newUser.save().then(async (data, err) => {
    console.log(data)
    if (err) {
      throw ({ error: err });
    }
  }).catch(async (err) => {
    console.log(err);
    throw ({ error: err })
  });

  req.validParams = {email:req.validParams.email,password:req.validParams.password}

  return userLogin.handler(req,res,next);
}

//checks if given email is already registered with a user
const checkIfEmailExists = async (email) => {
  await UserModel.findOne({
    email: email
  }).then(async (data, err) => {
    if (data) {
      throw ({ status: 403, error: "Email Exists" });
    }
  })
}