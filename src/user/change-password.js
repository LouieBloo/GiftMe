const mongoose = require('mongoose');
const UserModel = mongoose.model('users');
const { check } = require('express-validator');

module.exports.validation = [
    check('password').trim().isLength({ min: 8, max: 36 }).withMessage("Password must be 8-36 characters long"),
    check('token').trim().isLength({ min: 1, max: 50 }).withMessage("Token is incorrect length")

  ];
module.exports.handler = async (req, res, next) => {

  let targetUser = await UserModel.findOne({'passwordReset.token': req.validParams.token})

  if(!targetUser){
    throw { status: 404, error: {message: "No email found"}}
  }
  targetUser.checkToken(req.validParams.token)
  targetUser.setPassword(req.validParams.password);

  await targetUser.save();

  return { status: 200, response: "Ok" }
}