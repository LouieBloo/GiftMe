const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

var schema = new Schema({
  name : {type:String},
  owner:{type:Schema.Types.ObjectId,ref:'users',required:true},
  items:[{type:Schema.Types.ObjectId,ref:'wishlist_item'}],
  address:{type:String},
  subscribers:[{
    userId: {type:Schema.Types.ObjectId,ref:'users'},
    subscribedOn: {type:Date,default:Date.now}
  }],
  dateCreated:{type:Date,default:Date.now},
  finishDate:{type:Date},
  pendingNotificationJobId:{type:String}
});

schema.methods.addSubscriber = function (userId) {
  if(this.subscribers.some(e => e.userId == userId)){
  }else{
    this.subscribers.push({userId:new ObjectId(userId)})
  }
};

module.exports = mongoose.model('wishlist',schema);