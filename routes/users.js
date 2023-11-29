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
router.post('/logout',users.logout)

router.post('/deleteUser',users.deleteUser)


router.post('/socialLogin',users.socialLogin);




router.get('/getInterestList',checkUserStatus.userStatus,users.getInterestList);
router.post('/userInterest',checkUserStatus.userStatus,users.userInterest)
router.post('/userFavoriteColors',checkUserStatus.userStatus,users.userFavoriteColors) 

router.put('/forgotPassword',users.forgotPassword) 
router.put('/resetPassword',users.resetPassword) 
router.put('/changePassword',users.changePassword) 
// ,checkUserStatus.userStatus
router.get('/getProfile',users.getProfile);

router.post('/updateUserProfile',
// checkUserStatus.userStatus,
uploadFiles('public/images/profiles').single("profile_picture"),users.updateUserProfile);
router.get('/getUserInterest',users.getUserInterest);



module.exports = router;




