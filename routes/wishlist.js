var express = require('express');
var router = express.Router();

const tokenValidator = require('../src/authentication/tokens')
const routeManager = require('./route-manager')
const createList = require('../src/wish-list/list/create')
const getList = require('../src/wish-list/list/get')
const deleteList = require('../src/wish-list/list/delete')

const addItem = require('../src/wish-list/list/item/add');
const updateItem = require('../src/wish-list/list/item/update');
const deleteItem = require('../src/wish-list/list/item/delete');
const claimItem = require('../src/wish-list/list/item/claim');

//list
router.post('/', [tokenValidator], routeManager(createList));
router.get('/', [tokenValidator], routeManager(getList));
router.get('/:id', [tokenValidator], routeManager(getList));
router.delete('/:id', [tokenValidator], routeManager(deleteList));
//item
router.post('/item',[tokenValidator],routeManager(addItem));
router.patch('/item/:id',[tokenValidator],routeManager(updateItem));
router.delete('/item/:id',[tokenValidator],routeManager(deleteItem));
router.patch('/item/:id/claim',[tokenValidator],routeManager(claimItem));

module.exports = router;
