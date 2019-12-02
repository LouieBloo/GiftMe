const mongoose = require('mongoose');
const ListModel = mongoose.model('wishlist');
const { check } = require('express-validator');

module.exports.validation = [
  check('id').trim().isLength({ min: 2, max: 60 }).withMessage("Id must be 2-60 characters long").optional(),
  check('owner').trim().isLength({ min: 2, max: 60 }).withMessage("Owner must be 2-60 characters long").optional()
];
module.exports.handler = async (req, res, next) => {

  let filter = {};
  if(req.validParams.id){
    filter._id = req.validParams.id;
  }
  if(req.validParams.owner){
    filter.owner = req.validParams.owner;
  }

  if(Object.keys(filter).length === 0 && filter.constructor === Object){
    throw({status:400,error:"No filter"})
  }

  let targetWishList = await ListModel.find(filter)
  .populate('owner',{
    name: 1,
  })
  .populate('items')
  .then(async(data, err) => {
    if (err) {
      throw ({ error: err })
    }
    return data;
  });

  return {status:200,response:targetWishList}
}