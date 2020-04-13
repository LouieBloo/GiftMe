const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const EngagementModel = mongoose.model('engagement');
const WishlistModel = mongoose.model('wishlist');
const { check } = require('express-validator');

module.exports.validation = [
  check('limit').trim().isNumeric().toInt().withMessage("Limit must be a number").optional(),
];
module.exports.handler = async (req, res, next) => {

  let wishListIds = await EngagementModel.aggregate([
    {
      '$match': {
        'user': new ObjectId(req.credentials._id)
      }
    }, {
      '$group': {
        '_id': '$list', 
        'dateCreated': {
          '$max': '$dateCreated'
        }
      }
    }, {
      '$sort': {
        'dateCreated': -1
      }
    }, {
      '$limit': req.validParams.limit
    }
  ]).then(async (data, err) => {
    if (err) {
      throw ({ error: err })
    }
    if(!data || data.length == 0){
      return [];
    }

    let wishListIds = data.map(element => {
      return new ObjectId(element._id);
    });

    //we need to do another query to make it easier for us
    let wishlists = await WishlistModel.find({
      _id:{$in:wishListIds}
    },{_id:1,finishDate:1,name:1}).populate('owner', {
      name: 1,
    })

    return wishlists;
  });
  
  return { status: 200, response: wishListIds }
}