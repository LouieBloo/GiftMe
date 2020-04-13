var express = require('express');
var router = express.Router();

const index = require('./index');
const users = require('./users')
const wishList = require('./wishlist');
const engagement = require('./engagement');

router.get('/',index);

router.use('/users',users);
router.use('/wishlist',wishList);
router.use('/engagement',engagement);

module.exports = router;
