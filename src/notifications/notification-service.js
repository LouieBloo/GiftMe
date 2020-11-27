const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const ItemModel = mongoose.model('wishlist_item');
const ListModel = mongoose.model('wishlist');
const WishlistModel = mongoose.model('wishlist');
const NotificationModel = mongoose.model('notifications');
const queueService = require('../queue/queue-service');
const mainConfig = require('../../config/main-app-config');

//When a wishlist item is created
module.exports.itemCreated = async(item,list)=>{
  if(!mainConfig.sendingNotifications){return;}
  //if no subscribers return
  if(!list.subscribers.length > 0){return;}

  //create the new list item
  let notification = new NotificationModel();
  notification.type = "item-created";
  notification.data = {itemId:new ObjectId(item._id),listId:new ObjectId(list._id)};

  await notification.save().then(async (data) => {
    //we are independant of any route, dont do anything
  }).catch(async (err) => {
    console.error("Error creating item created notification: ",err);
  });

  //schedule a queued notification
  queueService.itemDiff(list._id);
}

//When a wishlist item is updated
module.exports.itemUpdated = async(newItem,beforeItem)=>{
  if(!mainConfig.sendingNotifications){return;}
  
  //find target list so we know the subscriber count
  let targetList = await ListModel.findOne({
    items:{
      $in:[new ObjectId(newItem._id)]
    }
  }).catch(async(err)=>{
  });

  //if no subscribers return
  if(!targetList || !targetList.subscribers.length > 0){return;}

  let diff = diffItems(newItem,beforeItem);
  if(diff == {}){return;}

  //create the new list item
  let notification = new NotificationModel();
  notification.type = "item-updated";
  notification.data = {itemId:new ObjectId(newItem._id),listId:new ObjectId(targetList._id),diff:diff};

  await notification.save().then(async (data) => {
    //we are independant of any route, dont do anything
  }).catch(async (err) => {
    console.error("Error creating item created notification: ",err);
  });

  //schedule a queued notification
  queueService.itemDiff(targetList._id);
}

//returns the diff between two items
const diffItems = (newItem,beforeItem)=>{
  let diff = {};
  let keys = ['name','description','link'];
  keys.forEach(key=>{
    if(newItem[key] != beforeItem[key]){
      diff[key] = {
        before:beforeItem[key],
        after:newItem[key]
      }
    }
  })
  return diff;
}