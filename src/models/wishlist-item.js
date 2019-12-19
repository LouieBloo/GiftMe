const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
  name : {type:String,required:true},
  link: {type:String},
  description: {type:String},
  owner:{type:Schema.Types.ObjectId,ref:'users',required:true},
  claimedUser:{type:Schema.Types.ObjectId,ref:'users'},
  claimedUserMessage:{type:String},
  dateCreated:{type:Date,default:Date.now},
  dateClaimed:{type:Date},
});

module.exports = mongoose.model('wishlist_item',schema);