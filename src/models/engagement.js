const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
  user:{type:Schema.Types.ObjectId,ref:'users',required:true},
  list:{type:Schema.Types.ObjectId,ref:'wishlist'},
  dateCreated:{type:Date,default:Date.now}
});

module.exports = mongoose.model('engagement',schema);