const mongoose = require('mongoose');
const ItemModel = mongoose.model('wishlist_item');
const ListModel = mongoose.model('wishlist');
const { check } = require('express-validator');

module.exports.validation = [
  check('id').trim().isLength({ min: 2, max: 60 }).withMessage("Id must be 2-60 characters long"),
];
module.exports.handler = async (req, res, next) => {

  let targetList = await ListModel.findOne({
    _id : req.validParams.id,
    owner : req.credentials._id
  }).catch(async(err)=>{
    throw({error:err})
  })

  if(targetList && targetList.items){
    await ItemModel.deleteMany({
      owner : req.credentials._id,
      _id : {$in:targetList.items}
    }).catch(async(err)=>{
      throw({error:err})
    })
  }

  await ListModel.deleteOne({
    _id : req.validParams.id,
    owner : req.credentials._id
  }).catch(async(err)=>{
    throw({error:err})
  })

  return {status:200,response:{}}
}