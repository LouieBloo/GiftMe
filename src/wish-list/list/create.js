const mongoose = require('mongoose');
const UserModel = mongoose.model('users');
const ListModel = mongoose.model('wishlist');
const { check } = require('express-validator');

module.exports.validation = [
  check('name').trim().isLength({ min: 2, max: 60 }).withMessage("Name must be 2-60 characters long")
];
module.exports.handler = async (req, res, next) => {

  let newList = new ListModel();
  newList.name = req.validParams.name;
  newList.owner = req.credentials._id;

  //save the user
  let createdList = await newList.save().then(async (data, err) => {
    if (err) {
      throw ({error: err });
    }
    return data;
  }).catch(async (err) => {
    console.log(err);
    throw ({ error: err })
  });

  return {status:201,response:createdList}
}