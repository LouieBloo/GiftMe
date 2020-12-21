const mongoose = require('mongoose');
const UserModel = mongoose.model('users');
const { check } = require('express-validator');

module.exports.validation = [
  check('email').trim().isEmail().withMessage("Not a valid email."),
];
module.exports.handler = async (req, res, next) => {

  let targetUser = await UserModel.findOne({email: req.validParams.email})

  if(!targetUser){
    throw { status: 404, error: {message: "No email found"}}
  }

  targetUser.createPasswordReset();

  await targetUser.save();

  return { status: 200, response: "Ok" }
}