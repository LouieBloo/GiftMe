const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let notificationsSchema = new Schema({
  type: { type: String, required: true },
  to: { type: Schema.Types.ObjectId, ref: 'users'},
  data: { type: Schema.Types.Mixed },
  dateCreated: { type: Date, default: Date.now },
});

notificationsSchema.methods.sfd = function (password) {

};


module.exports = mongoose.model('notifications', notificationsSchema);