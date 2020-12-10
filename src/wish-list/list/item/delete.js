const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const ItemModel = mongoose.model('wishlist_item');
const ListModel = mongoose.model('wishlist');
const { check } = require('express-validator');

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

  //delete it
  await ItemModel.deleteOne({
    owner: req.credentials._id,
    _id: req.validParams.id
  })

  return { status: 200, response: {} }
}