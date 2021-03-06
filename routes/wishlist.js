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
const getClaimed = require('../src/wish-list/list/item/getClaimed');
const purchaseItem = require('../src/wish-list/list/item/purchase');
const unPurchaseItem = require('../src/wish-list/list/item/un-purchase');

const addSubscriber = require('../src/wish-list/list/subscribers/add-subscriber');
const deleteSubscriber = require('../src/wish-list/list/subscribers/delete-subscriber');

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
router.get('/item/claimed',[tokenValidator],routeManager(getClaimed));
router.patch('/item/:id/purchase',[tokenValidator],routeManager(purchaseItem));
router.patch('/item/:id/unpurchase',[tokenValidator],routeManager(unPurchaseItem));
//items icons
router.get('/item/icons',routeManager(getIcons));
//subscribers
router.post('/:id/subscriber',[tokenValidator],routeManager(addSubscriber));
router.delete('/:id/subscriber',[tokenValidator],routeManager(deleteSubscriber));

module.exports = router;
