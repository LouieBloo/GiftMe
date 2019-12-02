const mongoose = require('mongoose');
const ItemModel = mongoose.model('wishlist_item');
const { check } = require('express-validator');

module.exports.validation = [
  check('id').trim().isLength({ min: 2, max: 60 }).withMessage("Id must be 2-60 characters long"),
];
module.exports.handler = async (req, res, next) => {

  await ItemModel.deleteOne({
    owner : req.credentials._id,
    _id : req.validParams.id
  })

  return {status:200,response:{}}
}