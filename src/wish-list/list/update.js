const mongoose = require('mongoose');
const UserModel = mongoose.model('users');
const ListModel = mongoose.model('wishlist');
const { check } = require('express-validator');
const notificationService = require('../../notifications/notification-service');

module.exports.validation = [
  check('id').trim().isLength({ min: 2, max: 60 }).withMessage("Id must be 2-60 characters long"),
  check('name').trim().isLength({ min: 2, max: 60 }).withMessage("Name must be 2-60 characters long").optional(),
  check('address').trim().isLength({ min: 2, max: 256 }).withMessage("Address must be 2-256 characters long").optional({nullable:true}),
  check('finishDate').trim().isLength({ min: 2, max: 256 }).withMessage("Date must be 2-256 characters long").optional()
];
module.exports.handler = async (req, res, next) => {

  let targetList = await ListModel.findOne({
    owner : req.credentials._id,
    _id : req.validParams.id
  })

  //save a copy so we can diff it later
  let copy = JSON.parse(JSON.stringify(targetList));

  if(targetList == null){
    throw({status:400,error:"Target List not found"})
  }

  if(req.validParams.name){
    targetList.name = req.validParams.name;
  }

  if(req.validParams.address){
    targetList.address = req.validParams.address;
  }else{
    targetList.address = null;
  }

  if(req.validParams.finishDate){
    targetList.finishDate = req.validParams.finishDate;
  }

  let updatedList = await targetList.save().then(async(data)=>{
    return data;
  }).catch(async(err)=>{
    throw({status:503,error:err})
  })

  notificationService.listUpdated(updatedList,copy);

  return {status:201,response:updatedList}
}