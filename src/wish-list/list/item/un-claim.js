const mongoose = require('mongoose');
const ItemModel = mongoose.model('wishlist_item');
const { check } = require('express-validator');

module.exports.validation = [
  check('id').trim().isLength({ min: 2, max: 60 }).withMessage("Invalid Item Id")
];
module.exports.handler = async (req, res, next) => {

  //find the target item
  let targetItem = await ItemModel.findOne({
    _id : req.validParams.id
  }).catch(async(err)=>{
    throw({status:400,error:err})
  });

  if(targetItem == null){
    throw({status:400,error:"Target item not found"})
  }

  //dont let people who havne't claimed this unclaim its
  if(!targetItem.claimedUser || targetItem.claimedUser._id != req.credentials._id){
    throw({status:405,error:"Cannot un-claim something you haven't claimed"});
  }

  //clear the claimed user
  targetItem.claimedUser = undefined;

  await targetItem.save().then(async(data)=>{
  }).catch(async (err) => {
    throw ({ error: err })
  });

  return {status:200,response:targetItem}
}