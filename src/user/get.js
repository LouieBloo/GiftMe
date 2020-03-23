const mongoose = require('mongoose');
const UserModel = mongoose.model('users');
const { check } = require('express-validator');

module.exports.validation = [
  check('id').trim().isLength({ min: 2, max: 60 }).withMessage("Id must be 2-60 characters long"),
];
module.exports.handler = async (req, res, next) => {

  let targetUser = await UserModel.findById(req.validParams.id,{
      name:1,
      lastOnline:1, 
    })
    .lean()
    .then(async (data, err) => {
      if (err) {
        throw ({ error: err })
      }
      return data;
  });

  console.log(targetUser)
  
  return { status: 200, response: targetUser }
}