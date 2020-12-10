const mongoose = require('mongoose');
const ListModel = mongoose.model('wishlist');
const { check } = require('express-validator');

module.exports.validation = [
  check('id').trim().isLength({ min: 2, max: 60 }).withMessage("Id must be 2-60 characters long")
];
module.exports.handler = async (req, res, next) => {

  //find the list this item will be linked to
  let targetList = await ListModel.findOne({
    _id : req.validParams.id
  }).catch(async(err)=>{
    throw({status:400,error:err})
  });

  if(targetList == null){
    throw({status:400,error:"Target list not found"})
  }

  targetList.removeSubscriber(req.credentials._id);
  await targetList.save();

  return {status:200,response:targetList}
}