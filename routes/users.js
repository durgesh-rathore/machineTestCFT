var express = require('express');
var users=require('../controllers/users');
var authorization = require('../config/checkUserStatus')
var router = express.Router();
const { body,query } = require('express-validator');



router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/signup',[
  body('name').isAlphanumeric().isLength({ min: 3, max: 20 }),
  body('password').isLength({ min: 8 }),
  body('email').isEmail().withMessage('Invalid email address'),
  body('mobile_number').isMobilePhone().withMessage('Please provide a valid mobile number'),
],users.signup) ;

router.post('/signin',[
  body('password').isLength({ min: 8 }),
  body('email').isEmail().withMessage('Invalid email address'),
],users.signin);
router.post('/logout',users.logout)

router.get('/userList' ,authorization.userStatus,[
  query('login_user_id').notEmpty().withMessage('Query parameter "q" is required')
],users.userList) 




module.exports = router;




