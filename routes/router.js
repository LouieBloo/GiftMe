var express = require('express');
var router = express.Router();

const index = require('./index');
const users = require('./users')

router.get('/',index);

router.use('/users',users);

module.exports = router;
