var express = require('express');
var router = express.Router();

const tokenValidator = require('../src/authentication/tokens')
const routeManager = require('./route-manager')
const createList = require('../src/wish-list/list/create')
const getList = require('../src/wish-list/list/get')
const addItem = require('../src/wish-list/list/add-item');

router.post('/', [tokenValidator], routeManager(createList));
router.get('/', [tokenValidator], routeManager(getList));
router.post('/item',[tokenValidator],routeManager(addItem));

module.exports = router;
