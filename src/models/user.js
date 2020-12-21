const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const cryptoRandomString = require('crypto-random-string');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mainConfig = require('../../config/main-app-config');
const moment = require('moment')
const emailService = require('../emails/email-service');

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
  lastOnline:{type:Date,default:Date.now,required:true},
  passwordReset: {
    token: {type: String},
    expirationDate: {type: Date}
  }
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

usersSchema.methods.resetPassword = function(){
  let token = cryptoRandomString({length: 20});

  let newDate = moment(new Date()).add(60, 'minutes').toDate();

  this.passwordReset = {
    token: token,
    expirationDate: newDate
  }

};

usersSchema.methods.checkToken = function(token){
  if(token != this.passwordReset.token){
    return false
  }
  if(moment.now() <= this.passwordReset.expirationDate){
    return true
  }
  else {
    return false
  }
}

usersSchema.methods.sendResetPasswordEmail = async function(){

  await emailService.sendEmail(this.email, null, emailService.templateIds.resetPassword, {resetPasswordUrl:mainConfig.clientUrl+'/reset-password/'+this.passwordReset.token})

}



module.exports = mongoose.model('users',usersSchema);