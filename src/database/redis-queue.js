const Queue = require('bee-queue');
const mainConfig = require('../../config/main-app-config');

if(!mainConfig.sendingNotifications){
  console.log("Not using redis...");
  module.exports.notificationQueue = {process:()=>{}}
  return;
}

const queue = new Queue('notification', {
  redis: {
    host: mainConfig.redis.host,
    port: mainConfig.redis.port,
    password: mainConfig.redis.password
  },
  activateDelayedJobs: true,
  removeOnSuccess: true,
  removeOnFailure: true
});
console.log("Connecting queue?")

module.exports.notificationQueue = queue;