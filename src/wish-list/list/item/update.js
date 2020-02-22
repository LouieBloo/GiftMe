const mongoose = require('mongoose');
const ItemModel = mongoose.model('wishlist_item');
const { check } = require('express-validator');

module.exports.validation = [
  check('id').trim().isLength({ min: 2, max: 60 }).withMessage("Id must be 2-60 characters long"),
  check('name').trim().isLength({ min: 2, max: 60 }).withMessage("Name must be 2-60 characters long").optional(),
  check('link').trim().isURL().withMessage("Invalid link").optional({nullable:true}),
  check('description').trim().isLength({ min: 2, max: 256 }).withMessage("Invalid Description").optional({nullable:true}),
  check('icon').trim().isLength({ min: 2, max: 60 }).withMessage("Invalid Icon").optional({nullable:true})
];
module.exports.handler = async (req, res, next) => {

  if(!req.validParams.name && !req.validParams.link){
    throw({status:400,error:"Need something to update!"})
  }

  let targetItem = await ItemModel.findOne({
    owner : req.credentials._id,
    _id : req.validParams.id
  })

  if(targetItem == null){
    throw({status:400,error:"Target item not found"})
  }

  if(req.validParams.name){
    targetItem.name = req.validParams.name;
  }

  targetItem.link = req.validParams.link ? req.validParams.link : null;
  targetItem.description = req.validParams.description ? req.validParams.description : null;
  targetItem.icon = req.validParams.icon ? req.validParams.icon : null;

  let updatedItem = await targetItem.save().then(async(data)=>{
    return data;
  }).catch(async(err)=>{
    throw({status:503,error:err})
  })

  return {status:200,response:updatedItem}
}