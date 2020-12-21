var express = require('express');
var router = express.Router();

const routeManager = require('./route-manager')
const registerUser = require('../src/user/registration')
const loginUser = require('../src/user/login')
const tokenValidator = require('../src/authentication/tokens')
const getUser = require('../src/user/get')
const resetPassword = require('../src/user/reset-password')
const changePassword = require('../src/user/change-password')



router.post('/register', routeManager(registerUser));
router.post('/login',routeManager(loginUser));

router.get('/tokenCheck',[tokenValidator],function(req,res,next){
  res.json({
    userId:req.credentials._id
  })
})
router.get('/:id', [tokenValidator], routeManager(getUser));

router.post('/reset-password', routeManager(resetPassword));
router.post('/change-password', routeManager(changePassword));




module.exports = router;
