var mongoose = require('mongoose');
var mainConfig = require('../../config/main-app-config');

var connectDatabase = function () {
  return new Promise(function (resolve, reject) {

    let connectionString;
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      console.log("Mongo connection string: DEV")
      connectionString = mainConfig.database.url;
    } else {
      console.log("Mongo connection string: PRODUCTION")
      connectionString = dbConfig.fullProductionURL;
    }

    mongoose.connect(connectionString, {useCreateIndex: true, useNewUrlParser: true,useUnifiedTopology: true }).then(function () {
      console.log("Mongoose connected successfully <3");
      resolve();
    }).catch(function (error) {
      console.log("error starting mongoose:");
      console.log(error);
      reject();
    })

  });
}

exports.connect = connectDatabase
exports = mongoose;