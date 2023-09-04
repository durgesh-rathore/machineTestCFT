var express = require("express");
var { uploadFiles } = require("../config/custom");
var checkUserStatus = require("../config/checkUserStatus");
var postController = require("../controllers/posts");
var router = express.Router();
var multer = require("multer");
const storage = multer.memoryStorage(); // Use memory storage for the uploaded files
const upload = multer({ storage: storage });
// router.post(
//   "/new",
//   // checkUserStatus.userStatus,
//   uploadFiles("public/images/postImage").single("image"),
//   postController.new
// );


router.post(
  "/new",
  // checkUserStatus.userStatus,
  upload.single('image'),
  postController.new
);

router.get(
  "/getPostsAndEventsList",
//   checkUserStatus.userStatus,
  postController.getPostsAndEventsList
);
router.post(
  "/saveComment",
  checkUserStatus.userStatus,
  postController.saveComment
);
router.get(
  "/getCommentListOnPosts",
  checkUserStatus.userStatus,
  postController.getCommentListOnPosts
);
router.post(
  "/postEvent",
  checkUserStatus.userStatus,
  uploadFiles("public/images/postImage").single("image"),
  postController.postEvent
);
router.post("/liked", checkUserStatus.userStatus, postController.liked);
router.get(
  "/getLikedListOnPosts",
  checkUserStatus.userStatus,
  postController.getLikedListOnPosts
);
router.post("/attending", postController.attending);
router.post(
  "/likedOnComment",
  checkUserStatus.userStatus,
  postController.likedOnComment
);


router.get(
  "/getPostOrEventById",
  // checkUserStatus.userStatus,
  postController.getPostOrEventById
);

router.delete(
  "/deletePostOrEventById",
  // checkUserStatus.userStatus,
  postController.deletePostOrEventById
);


module.exports = router;
