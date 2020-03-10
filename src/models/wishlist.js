const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
  name : {type:String},
  owner:{type:Schema.Types.ObjectId,ref:'users',required:true},
  items:[{type:Schema.Types.ObjectId,ref:'wishlist_item'}],
  address:{type:String},
  dateCreated:{type:Date,default:Date.now},
  finishDate:{type:Date},
});

module.exports = mongoose.model('wishlist',schema);