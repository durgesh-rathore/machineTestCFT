var express = require('express');
var groupController=require('../controllers/group');
var router = express.Router();



router.post('/add',groupController.add) 
// router.post('/followUser',friend.followUser)



 



module.exports = router;
