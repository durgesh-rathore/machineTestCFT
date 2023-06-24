var express = require('express');
var users=require('../controllers/users');
var checkUserStatus = require('../config/checkUserStatus')
var router = express.Router();

/* GET users listing. */
var {uploadFiles  } = require("../config/custom");

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/signup',users.signup) 
router.post('/signin',users.signin)

router.post('/socialLogin',users.socialLogin);




router.get('/getInterestList',checkUserStatus.userStatus,users.getInterestList);
router.post('/userInterest',checkUserStatus.userStatus,users.userInterest)
router.post('/userFavoriteColors',checkUserStatus.userStatus,users.userFavoriteColors) 

router.put('/forgotPassword',users.forgotPassword) 
router.put('/resetPassword',users.resetPassword) 
router.get('/getProfile',checkUserStatus.userStatus,users.getProfile);

router.put('/updateUserProfile',checkUserStatus.userStatus,uploadFiles('public/images/profile_picture').single("profile_picture"),users.updateUserProfile);



module.exports = router;
