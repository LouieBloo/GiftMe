const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const ListModel = mongoose.model('wishlist');
const ItemModel = mongoose.model('wishlist_item');
const NotificationModel = mongoose.model('notifications');
const notificationQueue = require('../database/redis-queue').notificationQueue;
const NotificationEmailService = require('../notifications/notification-email-service');

const itemDelayTimeInSeconds = 60 * 20;

/**
 * takes in a listId, will check to see if something is queued for that list and queues it if there is not, or restarts it if there is
 * @param {} listId
 */
module.exports.listUpdated = async (listId) => {

  //check if the listId already has a notification queue id
  let targetList = await ListModel.findOne({
    _id: listId
  }).catch(async (err) => {
    console.log("Get notification list error: ", err)
  });
  //if this list has a pending notification we want to remove the job
  if (targetList.pendingNotificationJobId) {
    await notificationQueue.removeJob(targetList.pendingNotificationJobId).then(async (job) => {
    }).catch(async (err) => {
      console.log("Get notification job error: ", err)
    })
  }

  //create the job
  let job = await createJob(listId);
  //save the jobId on the list
  targetList.pendingNotificationJobId = job.id;
  await targetList.save();
}

/**
 * Creates a new job on the queue
 * @param {} listId 
 */
const createJob = async (listId) => {
  let fireDate = new Date();
  let newJob = await notificationQueue.createJob({ listId: listId })
    .delayUntil(new Date(fireDate.setSeconds(fireDate.getSeconds() + itemDelayTimeInSeconds)))
    .save().then(async (jb) => {
      console.log("created job: id=", jb.id)
      return jb;
    }).catch(err => {
      console.log("error:", err)
    })
  return newJob;
}

/**
 * When the queue pops we process the job
 */
notificationQueue.process(async (job) => {
  console.log(`Processing job ${job.id}`);
  //find the list in the jobs data field
  let targetList = await ListModel.findOne({
    _id: new ObjectId(job.data.listId)
  }).populate({path:"owner",select:'name'}).catch(async (err) => {
    console.log("process notification error: ", err)
  });
  //set the lists pending notification id to null so listUpdated knows 
  targetList.pendingNotificationJobId = null;
  targetList = await targetList.save();

  /**
   * 1. Get all notifications for this list
   * 2. Parse them in some meaningful manner then delete them
   * 3. Send the email to the subscribers
   */
  let parsedNotifications = await parseNotifications(targetList);
  await NotificationEmailService.sendListChangedEmail(parsedNotifications)

  //idk if we need this but keepin it for now
  return true;
});

//call our respective parsers and join together their output
// {
//   list: {
//     items: [
//       5fceff3901235316999d08d6,
//       5fcefb8c01235316999d08c5,
//       5fcef2ec4d916114f4b184f2
//     ],
//     _id: 5fcef2de4d916114f4b184f0,
//     subscribers: [ [Object] ],
//     dateCreated: 2020-12-08T03:28:30.611Z,
//     owner: {_id:5fbc7ea11c91cb015e47820a,name:'Luke'},
//     __v: 42,
//     address: '3710 Cedargate Way',
//     name: 'TEST 123',
//     finishDate: 2020-12-09T08:00:00.000Z,
//     pendingNotificationJobId: null
//   },
//   listNotification:  { action: 'update', before: {} } ,
//   itemNotifications: [ { action: 'update', item: [Object], before: [Object] } ]
// }
const parseNotifications = async (list) => {
  let allParsedNotifications = {
    list: list,
    listNotification: null,
    itemNotifications: null
  };

  let parsedItemNotifications = await parseItemNotifications(list._id);
  allParsedNotifications.itemNotifications = parsedItemNotifications;

  let parsedListNotifications = await parseListNotifications(list);
  allParsedNotifications.listNotification = parsedListNotifications;

  //delete notifications from db
  await NotificationModel.deleteMany({ "data.listId": new ObjectId(list._id) });

  return allParsedNotifications;
}

const parseListNotifications = async (list) => {
  //find all notifications that belong to this list
  let listNotifications = await NotificationModel.find({
    "data.listId": new ObjectId(list._id),
    type: {
      $in: ['list-updated']
    }
  }).sort({ dateCreated: 1 })//sort by oldest first, makes our logic easier down the line

  if(!listNotifications){return null;}
  //since we only have 1 list for this list, we have 1 final object
  let finalObject = {
    action: 'update',
    before: {}
  }
  listNotifications.forEach(notification => {
    //we are looping but there should only be 1 key in the diff
    for (let key in notification.data.diff) {
      //clobber anything that was already there or add it if its new
      //we clobber the stuff that is already there because the last notification of that type is the newest 
      finalObject.before[key] = notification.data.diff[key].before;
    }
  })

  return finalObject;
}

/**
 * Parses all item notifications for a given list id
 * Below is an example payload of the parsing of ONE item in the list
 * @param {*} listId 
 */
// {
//   {
//     action: 'update',
//     item: {
//       _id: 5fc855e74b15d208c9e66072,
//       dateCreated: 2020-12-03T03:05:11.087Z,
//       owner: 5fbc7ea11c91cb015e47820a,
//       name: '123123123',
//       __v: 0,
//       description: 'asdfasdfasdf',
//       link: 'https://www.youtube.com/watch?v=lJJT00wqlOo'
//     },
//     before: { description: 'whats good', name: 'Test 123', link: null }
//   }
// }
/**
 * This particular item ^ has had at least 3 updates. One for the description, one for name, and one for link. The before
 * of the final object is showing what the item USED to look like, the item in the object is the state NOW. Action tells us if
 * it was an update or create. Create will look similar but will NOT have a before field because its brand new.
 * 
 * The final return will be an object with many keys. Each key being an item id
 */
const parseItemNotifications = async (listId) => {
  //find all notifications that belong to this list
  let itemNotifications = await NotificationModel.find({
    "data.listId": new ObjectId(listId),
    type: {
      $in: ['item-created', 'item-updated','item-deleted']
    }
  }).sort({ dateCreated: 1 })//sort by oldest first, makes our logic easier down the line

  //we need to group the item notifications by itemId to make our life easier
  let groupedItemNotifications = {};
  itemNotifications.forEach(element => {
    if (groupedItemNotifications[element.data.itemId]) {
      groupedItemNotifications[element.data.itemId].push(element);
    } else {
      groupedItemNotifications[element.data.itemId] = [element];
    }
  });

  //holds the final return of this function
  let finalParsedObject = [];
  //loop over each group (item)
  for (let key in groupedItemNotifications) {
    let itemId = key;//conveniance
    //find the item that this group is referencing
    let item = await ItemModel.findOne({
      _id: new ObjectId(itemId)
    })
    
    //loop over each notification in this group
    groupedItemNotifications[key].forEach(notification => {
      if (notification.type == 'item-created') {
        parseItemCreated(finalParsedObject, item)
      } else if (notification.type == 'item-updated') {
        parseItemUpdated(finalParsedObject, item, notification)
      } else if (notification.type == 'item-deleted') {
        finalParsedObject = parseItemDeleted(finalParsedObject, notification)
      }
    })
  }

  return finalParsedObject;
}

//item created is easy, we just return the item that was created and the action of 'create'
const parseItemCreated = (finalParsedObject, item) => {
  if(!item){return;}
  //since we have sorted by oldest first, there should never be an update before an add
  finalParsedObject.push({
    action: 'create',
    item: item
  });
}

//we return a new list as the filter will break the reference on finalParsedObject
const parseItemDeleted = (finalParsedObject, notification) => {
  //we want to remove all notifications that this item has 
  let newObject = finalParsedObject.filter(parsedObject=> parsedObject.item._id != notification.data.itemId);
  
  //since we have sorted by oldest first, there should never be an update after a delete
  newObject.push({
    action: 'delete',
    item: notification.data.item
  });
  return newObject;
}


//update is harder as there could be X updates before we send the notification. We want the final payload
//to show only the NEWEST update on each field
const parseItemUpdated = (finalParsedObject, item, notification) => {
  if(!item){return;}

  let before = {};
  //see if there is already a parsed notification for this item
  let foundIndex = -1;
  for (var i = 0; i < finalParsedObject.length; i++) {
    if (finalParsedObject[i].item.id == item.id) {
      foundIndex = i;
      break;
    }
  }
  //check if we have already parsed this item in an update or create
  if (foundIndex >= 0) {
    //if this item has already been parsed and it was the create function we do nothing. The user only needs to see that the item was created, not that it
    //was created and updated 5 times
    if (finalParsedObject[foundIndex].action == 'create') {
      //do nothing
      return;
    } else {
      //since there already is a before field use that one to work off of
      before = finalParsedObject[foundIndex].before;
    }
  }

  //we are looping but there should only be 1 key in the diff
  for (let key in notification.data.diff) {
    //clobber anything that was already there or add it if its new
    //we clobber the stuff that is already there because the last notification of that type is the newest 
    before[key] = notification.data.diff[key].before;
  }

  let newObject = {
    action: 'update',
    item: item,
    before: before
  }
  //if there is already a parsed notification we update, else push new
  if (foundIndex >= 0) {
    finalParsedObject[foundIndex] = newObject;
  } else {
    finalParsedObject.push(newObject)
  }

}