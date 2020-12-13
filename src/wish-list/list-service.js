const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const ListModel = mongoose.model('wishlist');


module.exports.getSubscriberEmails = async(listId)=>{
  
  let subscribers = await ListModel.findOne({_id:new ObjectId(listId)},'subscribers.userId').populate('subscribers.userId','email').lean();

  return (subscribers.subscribers.map(sub=>{
    return sub.userId.email;
  }) )
}
