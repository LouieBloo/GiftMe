const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
  name : {type:String,required:true},
  owner:{type:Schema.Types.ObjectId,ref:'users',required:true},
  items:[{type:Schema.Types.ObjectId,ref:'wishlist_item'}],
  dateCreated:{type:Date,default:Date.now}
});

module.exports = mongoose.model('wishlist',schema);