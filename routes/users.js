var express = require('express');
var users=require('../controllers/users');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/signup',users.signup) 
router.post('/signin',users.signin)

router.get('/getInterestList',users.getInterestList);
router.put('/userInterest',users.userInterest)
router.put('/userFavoriteColors',users.userFavoriteColors) 

router.put('/forgotPassword',users.forgotPassword) 
router.put('/resetPassword',users.resetPassword) 


module.exports = router;
