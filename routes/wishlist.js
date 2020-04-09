var express = require('express');
var router = express.Router();

const tokenValidator = require('../src/authentication/tokens')
const routeManager = require('./route-manager')
const createList = require('../src/wish-list/list/create')
const getList = require('../src/wish-list/list/get')
const getListExists = require('../src/wish-list/list/exists')
const deleteList = require('../src/wish-list/list/delete')
const updateList = require('../src/wish-list/list/update')

const addItem = require('../src/wish-list/list/item/add');
const updateItem = require('../src/wish-list/list/item/update');
const deleteItem = require('../src/wish-list/list/item/delete');
const claimItem = require('../src/wish-list/list/item/claim');
const unClaimItem = require('../src/wish-list/list/item/un-claim');

const getIcons = require('../src/wish-list/list/item/icons');

//list
router.post('/', [tokenValidator], routeManager(createList));
router.post('/query', [tokenValidator], routeManager(getList));
router.get('/:id',[tokenValidator.open],tokenValidator.openPass,routeManager(getList));
router.get('/:id/exists', [tokenValidator.open],tokenValidator.openPass, routeManager(getListExists));
router.delete('/:id', [tokenValidator], routeManager(deleteList));
router.patch('/:id', [tokenValidator], routeManager(updateList));
//item
router.post('/item',[tokenValidator],routeManager(addItem));
router.patch('/item/:id',[tokenValidator],routeManager(updateItem));
router.delete('/item/:id',[tokenValidator],routeManager(deleteItem));
router.patch('/item/:id/claim',[tokenValidator],routeManager(claimItem));
router.patch('/item/:id/unclaim',[tokenValidator],routeManager(unClaimItem));
//items icons
router.get('/item/icons',routeManager(getIcons));

module.exports = router;
