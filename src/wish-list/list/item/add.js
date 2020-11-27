const mongoose = require('mongoose');
const ItemModel = mongoose.model('wishlist_item');
const ListModel = mongoose.model('wishlist');
const { check } = require('express-validator');
const IconWhitelist = require('../../../../config/icon-whitelist');
const notificationService = require('../../../notifications/notification-service');

module.exports.validation = [
  check('name').trim().isLength({ min: 2, max: 75 }).withMessage("Name must be 2-60 characters long"),
  check('listId').trim().isLength({ min: 2, max: 60 }).withMessage("Invalid List Id"),
  check('link').trim().isURL().withMessage("Invalid link").optional(),
  check('description').trim().isLength({ min: 2, max: 60 }).withMessage("Invalid Description").optional(),
  check('icon').trim().isLength({ min: 2, max: 60 }).withMessage("Invalid Icon").optional({nullable:true})
];
module.exports.handler = async (req, res, next) => {

  //find the list this item will be linked to
  let targetList = await ListModel.findOne({
    owner : req.credentials._id,
    _id : req.validParams.listId
  }).catch(async(err)=>{
    throw({status:400,error:err})
  });

  if(targetList == null){
    throw({status:400,error:"Target list not found"})
  }

  //create the new list item
  let newItem = new ItemModel();
  newItem.owner = req.credentials._id;
  newItem.name = req.validParams.name;

  if(req.validParams.link){
    newItem.link = req.validParams.link;
  }
  if(req.validParams.description){
    newItem.description = req.validParams.description;
  }
  if(req.body.icon){
    newItem.icon = IconWhitelist.iconNames.includes(req.body.icon) ? req.body.icon : null;
  }

  //save the new item
  let createdItem = await newItem.save().then(async (data) => {
    return data;
  }).catch(async (err) => {
    throw ({ error: err })
  });

  //attach new item to list
  targetList.items.unshift(createdItem._id);
  await targetList.save().then(async(data)=>{
  }).catch(async (err) => {
    throw ({ error: err })
  });


  //tell notification service we have created an item
  notificationService.itemCreated(createdItem,targetList);

  return {status:201,response:createdItem}
}