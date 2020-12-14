const mongoose = require('mongoose');
const ItemModel = mongoose.model('wishlist_item');
const { check } = require('express-validator');

module.exports.validation = [
  check('id').trim().isLength({ min: 2, max: 60 }).withMessage("Invalid Item Id")
];
module.exports.handler = async (req, res, next) => {

  //find the target items
  let targetItem = await ItemModel.findOne({
    _id : req.validParams.id,
    "claimedUser._id":req.credentials._id,
    purchased:{$ne:null}
  }).catch(async(err)=>{
    throw({status:400,error:err})
  });

  if(targetItem == null){
    throw({status:400,error:"Target item not found or it is not purchased"})
  }

  targetItem.unPurchase();

  await targetItem.save().then(async(data)=>{
  }).catch(async (err) => {
    throw ({ error: err })
  });


  return {status:200,response:targetItem}
}