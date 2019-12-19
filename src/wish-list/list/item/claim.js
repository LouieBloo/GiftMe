const mongoose = require('mongoose');
const ItemModel = mongoose.model('wishlist_item');
const { check } = require('express-validator');

module.exports.validation = [
  check('id').trim().isLength({ min: 2, max: 60 }).withMessage("Invalid Item Id"),
  check('force').trim().isBoolean().withMessage("Force is a boolean").optional(),
  check('message').trim().isLength({ min: 2, max: 200 }).withMessage("Invalid Message").optional()
];
module.exports.handler = async (req, res, next) => {

  //find the target items
  let targetItem = await ItemModel.findOne({
    _id : req.validParams.id
  }).catch(async(err)=>{
    throw({status:400,error:err})
  });

  if(targetItem == null){
    throw({status:400,error:"Target item not found"})
  }

  //item cant be claimed by owner of list
  if(targetItem.owner == req.credentials._id){
    throw({status:405,error:"You own this item!"});
  }

  //item cant be claimed if its already claimed, unless force flag
  if(targetItem.claimedUser && !req.validParams.force){
    throw({status:405,error:"Item is already claimed"});
  }

  targetItem.claimedUser = req.credentials._id;
  if(req.validParams.message){
    targetItem.claimedUserMessage = req.validParams.message;
  }

  await targetItem.save().then(async(data)=>{
  }).catch(async (err) => {
    throw ({ error: err })
  });

  return {status:200,response:targetItem}
}