const mongoose = require('mongoose');
const ItemModel = mongoose.model('wishlist_item');
const { check } = require('express-validator');
const AddSubscriber = require('../subscribers/add-subscriber');

module.exports.validation = [
  check('id').trim().isLength({ min: 2, max: 60 }).withMessage("Invalid Item Id"),
  check('force').trim().isBoolean().withMessage("Force is a boolean").optional()
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
  if(targetItem.claimedUser._id && !req.validParams.force){
    throw({status:405,error:"Item is already claimed"});
  }

  targetItem.claim(req.credentials._id);

  await targetItem.save().then(async(data)=>{
  }).catch(async (err) => {
    throw ({ error: err })
  });

  //claiming an item should subscribe the user to the list
  AddSubscriber.subscribeFromItemId(targetItem._id,req.credentials._id);

  return {status:200,response:targetItem}
}