const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
  name : {type:String,required:true},
  link: {type:String},
  description: {type:String},
  owner:{type:Schema.Types.ObjectId,ref:'users',required:true},
  claimedUser:{
    _id:{type:Schema.Types.ObjectId,ref:'users'},
    message:{type:String},
  },
  icon:{type:String},
  dateCreated:{type:Date,default:Date.now},
  dateClaimed:{type:Date},
});

module.exports = mongoose.model('wishlist_item',schema);