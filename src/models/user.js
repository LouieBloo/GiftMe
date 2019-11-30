const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mainConfig = require('../../config/main-app-config');

var usersSchema = new Schema({
  name: {type:String,required:true},
  email:{type:String,unique:true,required:true},
  registration:{
    emailToken:{type:String},  
    validEmail:{type:Boolean,default:false}
  },
  dateCreated:{type:Date,default:Date.now},
  pwHash:String,
  pwSalt:String,
  lastOnline:{type:Date,default:Date.now,required:true}
});

usersSchema.methods.setPassword = function(password){
  this.pwSalt = crypto.randomBytes(16).toString('hex');
  this.pwHash = crypto.pbkdf2Sync(password,this.pwSalt,1000,64,'sha512').toString('hex');
};

usersSchema.methods.validPassword = function(password){
  var hash = crypto.pbkdf2Sync(password,this.pwSalt,1000,64,'sha512').toString('hex');
  return this.pwHash === hash;
};

usersSchema.methods.generateJwt = function(){
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign({
    _id:this._id,
    email:this.email,
    name: this.name,
    exp: parseInt(expiry.getTime() / 1000)
  },
    mainConfig.jwt.secret
  );
}

module.exports = mongoose.model('users',usersSchema);