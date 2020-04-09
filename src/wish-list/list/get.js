const mongoose = require('mongoose');
const ListModel = mongoose.model('wishlist');
const { check } = require('express-validator');

module.exports.validation = [
  check('id').trim().isLength({ min: 2, max: 60 }).withMessage("Id must be 2-60 characters long").optional(),
  check('owner').trim().isLength({ min: 2, max: 60 }).withMessage("Owner must be 2-60 characters long").optional(),
  check('sort').optional()
];
module.exports.handler = async (req, res, next) => {
  //allow the GET request to handle a single wishlist or all wishlists for a user
  let filter = {};
  if (req.validParams.id) {
    filter._id = req.validParams.id;
  }
  if (req.validParams.owner) {
    filter.owner = req.validParams.owner;
  }

  //make sure we have at least 1 thing we are filtering by
  if (Object.keys(filter).length === 0 && filter.constructor === Object) {
    throw ({ status: 400, error: "No filter" })
  }

  let targetWishList = await ListModel.find(filter)
    .populate('owner', {
      name: 1,
    })
    .populate(
      {
        path: 'items',
        populate: {
          model:'users',
          path: 'claimedUser',
          select: {name:1},
          justOne:true
        }
      })
    .sort(req.validParams.sort)
    .lean()
    .then(async (data, err) => {
      if (err) {
        throw ({ error: err })
      }
      return data;
  });
  
  if(targetWishList != null && targetWishList.length > 0){
    removeClaimedUserFromResponse(targetWishList,req.credentials)
  }

  return { status: 200, response: targetWishList }
}

//Dont return any information about who has claimed an item if the list belongs to this user
const removeClaimedUserFromResponse = function(wishlists,credentials){
  wishlists.forEach(list=>{
    if(credentials && credentials._id && list.owner._id == credentials._id){
      //if we are logged in and are the list owner, delete the claimed user so the list owner doesnt know who has claimed the item
      list.items.forEach(item=>{
        delete(item.claimedUserMessage);
        delete(item.claimedUser);
      })
    }else if(credentials && credentials._id && list.owner._id != credentials._id){
      //if we are logged in and we are not the list owner do nothing. We want to see the claimed users if we are not the owner
    }else{
      //if we are not logged in than only show that there is a claimed user
      list.items.forEach(item=>{
        delete(item.claimedUserMessage);
        item.claimedUser = item.claimedUser ? true : null;
      })
    }
  })
}