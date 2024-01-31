var express = require('express');
var chats=require('../controllers/chats');
var authorization = require('../config/checkUserStatus')
var router = express.Router();
const { query } = require('express-validator');

router.get('/getChats' ,authorization.userStatus,[
    query('user_id').notEmpty().withMessage('Query parameter "q" is required')
],chats.getChats) 








module.exports = router;




