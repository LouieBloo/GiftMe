const mongoose = require('mongoose');
const UserModel = mongoose.model('users');
const ListModel = mongoose.model('wishlist');
const { check } = require('express-validator');
const IconWhitelist = require('../../../../config/icon-whitelist');

module.exports.validation = [
];
module.exports.handler = async (req, res, next) => {
  return {status:200,response:IconWhitelist.iconNames}
}