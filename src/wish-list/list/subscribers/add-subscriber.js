const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const ListModel = mongoose.model('wishlist');
const { check } = require('express-validator');

module.exports.validation = [
  check('id').trim().isLength({ min: 2, max: 60 }).withMessage("Id must be 2-60 characters long")
];
module.exports.handler = async (req, res, next, list) => {

  let targetList = null;
  if (list) {
    targetList = list;
  } else {
    //find the list this item will be linked to
    targetList = await ListModel.findOne({
      _id: req.validParams.id
    }).catch(async (err) => {
      throw ({ status: 400, error: err })
    });
  }


  if (targetList == null) {
    throw ({ status: 400, error: "Target list not found" })
  }

  targetList.addSubscriber(req.credentials._id);
  await targetList.save();

  return { status: 201, response: targetList }
}

module.exports.subscribeFromItemId = async (itemId, userId) => {
  //find target list so we know the subscriber count
  let targetList = await ListModel.findOne({
    items:{
      $in:[new ObjectId(itemId)]
    }
  }).catch(async(err)=>{
  });
  if(!targetList){
    return;
  }

  await this.handler({validParams:{id:targetList._id},credentials:{_id:userId}},null,null,targetList).catch(error=>{
    console.log("error subscribeFromItem: ", error)
  })
}