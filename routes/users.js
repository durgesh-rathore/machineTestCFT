var express = require('express');
var users=require('../controllers/users');
var checkUserStatus = require('../config/checkUserStatus')
var router = express.Router();



router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/signup',users.signup) 
router.post('/signin',users.signin)
router.post('/logout',users.logout)
router.get('/chatList',users.chatList)





module.exports = router;




