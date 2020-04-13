const mongoose = require('mongoose');
const EngagementModel = mongoose.model('engagement');

module.exports.viewList = async (req,list) => {
  if (!req.credentials || !req.credentials._id) {return;}
  if(req.credentials._id == list.owner._id){return;}

  let engagement = new EngagementModel();
  engagement.user = req.credentials._id;
  engagement.list = list._id;

  //save the user
  let savedEngagement = await engagement.save().then(async (data) => {
    //ok
  }).catch(async (err) => {
    console.error("Error saving view list engagement: ", err);
  });
}