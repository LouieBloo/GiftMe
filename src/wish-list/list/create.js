const mongoose = require('mongoose');
const UserModel = mongoose.model('users');
const ListModel = mongoose.model('wishlist');
const { check } = require('express-validator');

module.exports.validation = [
  check('name').trim().isLength({ min: 2, max: 60 }).withMessage("Name must be 2-60 characters long").optional()
];
module.exports.handler = async (req, res, next) => {

  let newList = new ListModel();

  if (req.validParams.name) { newList.name = req.validParams.name; }
  
  newList.owner = req.credentials._id;

  //save the user
  let createdList = await newList.save().then(async (data) => {
    return data;
  }).catch(async (err) => {
    throw ({ error: err })
  });

  return { status: 201, response: createdList }
}