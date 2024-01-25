var express = require("express");
var friend = require("../controllers/friends");
var checkUserStatus = require("../config/checkUserStatus");

var router = express.Router();

router.post("/followUser",
  //  checkUserStatus.userStatus, 
    friend.followUser);
router.post("/requestForUser", checkUserStatus.userStatus, friend.requestForUser);

router.put("/unFollowUser", checkUserStatus.userStatus, friend.unFollowUser);
router.put("/blockUser", checkUserStatus.userStatus, friend.blockUser);
router.put("/rejectUser", checkUserStatus.userStatus, friend.rejectUser);

router.put("/acceptRequest", checkUserStatus.userStatus, friend.acceptRequest);
router.get("/friendsList", 
// checkUserStatus.userStatus,
 friend.friendsList);
router.get(
  "/getBlockUserList",
  // checkUserStatus.userStatus,
  friend.getBlockUserList
);


router.get(
  "/friendsListForVisibitly",
  // checkUserStatus.userStatus,
  friend.friendsListForVisibitly
);

router.get("/friendsListAccordingToAddInGroup", 
// checkUserStatus.userStatus,
 friend.friendsListAccordingToAddInGroup);

 router.get("/getFollowerUserList", 
// checkUserStatus.userStatus,
 friend.getFollowerUserList);

 router.get("/getFollowingUserlist", 
// checkUserStatus.userStatus,
 friend.getFollowingUserlist);

module.exports = router;
