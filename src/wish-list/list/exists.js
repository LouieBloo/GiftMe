const mongoose = require('mongoose');
const ListModel = mongoose.model('wishlist');
const { check } = require('express-validator');

module.exports.validation = [
  check('id').trim().isLength({ min: 2, max: 60 }).withMessage("Id must be 2-60 characters long"),
];
module.exports.handler = async (req, res, next) => {

  let targetWishList = await ListModel.findById(req.validParams.id).then(async (data, err) => {
    if (err) {
      throw ({ error: "Not Found",status:404 })
    }
    return data;
  }).catch(err=>{
    throw ({ error: "Not Found",status:404 })
  });

  return { status: 200, response: "Found" }
}
