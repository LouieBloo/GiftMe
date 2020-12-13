const emailService = require('../emails/email-service');
const listService = require('../wish-list/list-service');
const moment = require('moment');
//
// REFERENCE LIST NOTIFICATION PARAMETER
//
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
module.exports.sendListChangedEmail = async (listNotification) => {

  //list changes
  let listChanges = [];
  if (listNotification.listNotification && listNotification.listNotification.action) {
    for (let key in listNotification.listNotification.before) {
      listChanges.push({
        key: key,
        before: parseKey(key, listNotification.listNotification.before),
        after: parseKey(key, listNotification.list)
      })
    }
  }
  //item changes
  let itemChanges = [];
  if (listNotification.itemNotifications) {
    listNotification.itemNotifications.forEach(itemNotification => {
      let updates = [];
      //if this item was created we have to parse it a bit differently
      if (itemNotification.action == 'create') {
        //loop over all possible keys for our new object. Notice how our before is hard coded
        ['description', 'link'].forEach(key => {
          if(!itemNotification.item[key]){return;}
          updates.push({
            key: key,
            before: "",
            after: parseKey(key, itemNotification.item)
          })
        })
      } else {
        //each item before change
        for (let key in itemNotification.before) {
          updates.push({
            key: key,
            before: parseKey(key, itemNotification.before),
            after: parseKey(key, itemNotification.item)
          });
        }
      }
      itemChanges.push({
        action: (itemNotification.action + "d").toUpperCase(),
        name: itemNotification.item.name,
        updates: updates
      })
    });
  }


  sendEmail(listNotification,listChanges,itemChanges)

}

const sendEmail = async(listNotification,listChanges,itemChanges)=>{
  let subscriberEmails = await listService.getSubscriberEmails(listNotification.list._id);
  await emailService.sendEmail(subscriberEmails,null,emailService.templateIds.listUpdate,{
    listOwnerName: listNotification.list.owner.name,
    listName:listNotification.list.name,
    listChanges:listChanges,
    itemChanges:itemChanges
  })
}

const parseKey = (key, object) => {
  if (key == 'finishDate') {
    return moment(object[key]).format("MM/DD/YYYY")
  }
  return object[key]
}

