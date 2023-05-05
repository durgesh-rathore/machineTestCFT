var express = require('express');
var {uploadFiles  } = require("../config/custom");
var postController=require('../controllers/posts');
var router = express.Router();



router.post('/new',uploadFiles('public/images/postImage').single("image"),postController.new) 


router.post('/visibility',postController.visibility);
router.get('/getPostsList',postController.getPostsList) 

router.post('/saveComment',postController.saveComment);
router.get('/getCommentListOnPosts',postController.getCommentListOnPosts) 

router.post('/saveEvent',postController.saveEvent);
router.put('/postEvent',uploadFiles('public/images/postImage').single("image"),postController.postEvent);
router.post('/liked',postController.liked);
router.get('/getLikedListOnPosts',postController.getLikedListOnPosts) 








module.exports = router;
