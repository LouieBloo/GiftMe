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
    },
    {
      '$group': {
        '_id': '$list',
        'dateCreated': {
          '$max': '$dateCreated'
        }
      }
    },
    {
      '$sort': {
        'dateCreated': -1
      }
    },
    {
      '$limit': req.validParams.limit
    }
  ]).then(async (data, err) => {
    if (err) {
      throw ({ error: err })
    }
    if (!data || data.length == 0) {
      return [];
    }

    let ids = data.map(element => {
      return new ObjectId(element._id);
    });


    //we need to do another query to make it easier for us
    let wishlists = await WishlistModel.find({
      _id: {
        $in: ids
      }
    }, {
        _id: 1,
        finishDate: 1,
        name: 1,
        items: 1
      }).populate('owner', {
        name: 1,
      }).populate('items', {
        name: 1
      }).lean()

    //we need to join the lists we fetched into the engagements to retain order
    let finalWishLists = [];
    data.forEach(engagement => {
      let returnObj = {};
      for(let x = 0; x < wishlists.length; x++){
        if(engagement._id.toString() == wishlists[x]._id.toString()){
          returnObj = wishlists[x];
          break;
        }
      }
      //in case the engagment list was deleted
      if(returnObj._id){
        returnObj.engagement = {
          dateCreated:engagement.dateCreated
        }
        finalWishLists.push(returnObj)
      }
    });

    return finalWishLists;
  });

  return { status: 200, response: wishListIds }
}