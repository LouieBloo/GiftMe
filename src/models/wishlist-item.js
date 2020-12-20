const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
  name : {type:String,required:true},
  link: {type:String},
  description: {type:String},
  owner:{type:Schema.Types.ObjectId,ref:'users',required:true},
  claimedUser:{
    _id:{type:Schema.Types.ObjectId,ref:'users'}
  },
  dateClaimed:{type:Date},
  purchased:{
    datePurchased:{type:Date},
  },
  icon:{type:String},
  dateCreated:{type:Date,default:Date.now}
});

schema.methods.claim = function (userId) {
  this.claimedUser = {
    _id:userId
  }
  this.dateClaimed = new Date();
};

schema.methods.unClaim = function () {
  this.claimedUser = undefined;
  this.dateClaimed = undefined;
  this.purchased = undefined;
};

schema.methods.purchase = function () {
  this.purchased = {
    datePurchased:new Date()
  }
};

schema.methods.unPurchase = function () {
  this.purchased = undefined;
};

module.exports = mongoose.model('wishlist_item',schema);