const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
  name : {type:String,required:true},
  link: {type:String},
  claimedUser:{type:Schema.Types.ObjectId,ref:'users'},
  dateCreated:{type:Date,default:Date.now},
  dateClaimed:{type:Date},
});

module.exports = mongoose.model('wishlist_item',schema);