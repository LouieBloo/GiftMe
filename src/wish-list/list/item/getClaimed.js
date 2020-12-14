const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const ItemModel = mongoose.model('wishlist_item');
const { check } = require('express-validator');

module.exports.validation = [
];
module.exports.handler = async (req, res, next) => {
  let claimedItems = await ItemModel.aggregate([
    {
      '$match': {
        'claimedUser._id': new ObjectId(req.credentials._id)
      }
    }, {
      '$lookup': {
        'from': 'users', 
        'localField': 'owner', 
        'foreignField': '_id', 
        'as': 'owner'
      }
    }, {
      '$unwind': '$owner'
    }, {
      '$lookup': {
        'from': 'wishlists', 
        'localField': '_id', 
        'foreignField': 'items', 
        'as': 'list'
      }
    }, {
      '$unwind': '$list'
    }, {
      '$project': {
        'dateCreated': 1, 
        'dateClaimed': 1, 
        'link': 1, 
        '_id': 1, 
        'name': 1, 
        'description': 1, 
        'icon': 1, 
        'list.name': 1, 
        'list._id': 1, 
        'owner.name': 1,
        'purchased':1
      }
    }, {
      '$sort': {
        'dateClaimed': -1
      }
    }, {
      '$limit': 100
    }
  ])
  .then(async (data, err) => {
    if (err) {
      throw ({ error: err })
    }
    return data;
  });

  return { status: 200, response: claimedItems }
}