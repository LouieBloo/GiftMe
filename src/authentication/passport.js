var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var userModel = mongoose.model('users');

passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  function(username,password,done){

    userModel.findOne({email:username},function(err,user){
      if(err){
        console.log("passport error:");
        console.log(err);
        return done(err);
      }
      if(!user){
        return done(null,false,{
          message: 'User Not found ya nerd!'
        });
      }
      if(!user.validPassword(password)){
        return done(null,false,{
          message: 'Password is wrong nerd!'
        });
      }

      return done(null,user);
    });
  }
));