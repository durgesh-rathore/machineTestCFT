var express = require('express');
var friend=require('../controllers/friends');
var router = express.Router();



router.get('/exploreList',friend.exploreList) 
router.post('/followUser',friend.followUser)

router.put('/unFollowUser',friend.unFollowUser) 
router.put('/blockUser',friend.blockUser) 
router.put('/rejectUser',friend.rejectUser) 
router.put('/unBlockUser',friend.unBlockUser) 


router.get('/requestsList',friend.requestsList);

router.put('/acceptRequest',friend.acceptRequest);

router.get('/allFriendsList',friend.allFriendsList); 

 



module.exports = router;
