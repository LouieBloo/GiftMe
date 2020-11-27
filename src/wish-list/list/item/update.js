const mongoose = require('mongoose');
const ItemModel = mongoose.model('wishlist_item');
const { check } = require('express-validator');
const IconWhitelist = require('../../../../config/icon-whitelist');
const notificationService = require('../../../notifications/notification-service');

module.exports.validation = [
  check('id').trim().isLength({ min: 2, max: 60 }).withMessage("Id must be 2-60 characters long"),
  check('name').trim().isLength({ min: 2, max: 75 }).withMessage("Name must be 2-60 characters long").optional(),
  check('link').trim().isURL().withMessage("Invalid link").optional({nullable:true}),
  check('description').trim().isLength({ min: 2, max: 256 }).withMessage("Invalid Description").optional({nullable:true}),
  check('icon').trim().isLength({ min: 2, max: 60 }).withMessage("Invalid Icon").optional({nullable:true})
];
module.exports.handler = async (req, res, next) => {

  if(!req.validParams.name && !req.validParams.link){
    throw({status:400,error:"Need something to update!"})
  }

  //find target item to update
  let targetItem = await ItemModel.findOne({
    owner : req.credentials._id,
    _id : req.validParams.id
  })

  //save a copy so we can diff it later
  let copy = JSON.parse(JSON.stringify(targetItem));

  if(targetItem == null){
    throw({status:400,error:"Target item not found"})
  }

  //there always has to be a name so we explicitly check
  if(req.validParams.name){
    targetItem.name = req.validParams.name;
  }

  //either set it to what is passed in or default it back to null
  targetItem.link = req.validParams.link ? req.validParams.link : null;
  targetItem.description = req.validParams.description ? req.validParams.description : null;
  
  //if there is no icon it doesnt mean to wipe it, null passed in means wipe
  if(req.body.icon){
    targetItem.icon = IconWhitelist.iconNames.includes(req.body.icon) ? req.body.icon : null;
  }
  

  let updatedItem = await targetItem.save().then(async(data)=>{
    return data;
  }).catch(async(err)=>{
    throw({status:503,error:err})
  })

  //notification service needs to know to create an update notification
  notificationService.itemUpdated(updatedItem,copy);

  return {status:200,response:updatedItem}
}