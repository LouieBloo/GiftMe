const mongoose = require('mongoose');
const ItemModel = mongoose.model('wishlist_item');
const { check } = require('express-validator');

module.exports.validation = [
  check('id').trim().isLength({ min: 2, max: 60 }).withMessage("Invalid Item Id"),
  check('force').trim().isBoolean().withMessage("Force is a boolean").optional()
];
module.exports.handler = async (req, res, next) => {

  //find the list this item will be linked to
  let targetItem = await ItemModel.findOne({
    _id : req.validParams.id
  }).catch(async(err)=>{
    throw({status:400,error:err})
  });

  if(targetItem == null){
    throw({status:400,error:"Target item not found"})
  }

  //item cant be claimed if its already claimed, unless force flag
  if(targetItem.claimedUser && !req.validParams.force){
    throw({status:405,error:"Item is already claimed"});
  }

  targetItem.claimedUser = req.credentials._id;

  await targetItem.save().then(async(data)=>{
  }).catch(async (err) => {
    throw ({ error: err })
  });

  return {status:200,response:targetItem}
}