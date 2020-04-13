var express = require('express');
var router = express.Router();
const routeManager = require('./route-manager')
const tokenValidator = require('../src/authentication/tokens')

const getList = require('../src/engadgement/list/get')

router.get('/list', [tokenValidator], routeManager(getList));
module.exports = router;
