const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const ItemModel = mongoose.model('wishlist_item');
const ListModel = mongoose.model('wishlist');
const { check } = require('express-validator');
const notificationService = require('../../../notifications/notification-service');

module.exports.validation = [
  check('id').trim().isLength({ min: 2, max: 60 }).withMessage("Id must be 2-60 characters long"),
];
module.exports.handler = async (req, res, next) => {

  //remove this item from the wishlist
  let targetList = await ListModel.findOne({ "items": { $in: [new ObjectId(req.validParams.id)] } }).catch(async (err) => {
    throw ({ status: 400, error: err })
  });
  targetList.items.pull(new ObjectId(req.validParams.id))
  await targetList.save();

  //get the item so notifiaction service can use it
  let targetItem = await ItemModel.findOne({_id: req.validParams.id});
  targetItem = targetItem.toObject();

  //delete it
  await ItemModel.deleteOne({
    owner: req.credentials._id,
    _id: req.validParams.id
  })

  //tell notification service we have deleted an item
  notificationService.itemDeleted(targetItem,targetList);

  return { status: 200, response: {} }
}