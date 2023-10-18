var express = require("express");
var groupController = require("../controllers/group");
var checkUserStatus = require("../config/checkUserStatus");
var router = express.Router();

router.post("/add", checkUserStatus.userStatus, groupController.add);
router.post(
  "/addMembersInGroup",
  checkUserStatus.userStatus,
  groupController.addMembersInGroup
);
router.get(
  "/getGroupList",
  checkUserStatus.userStatus,
  groupController.getGroupList
);

// split groups api's
router.post(
  "/addSplitGroup",
//   checkUserStatus.userStatus,
  groupController.addSplitGroup
);
router.post(
  "/addMembersInSplitGroup",
//   checkUserStatus.userStatus,
  groupController.addMembersInSplitGroup
);
router.get(
  "/getSplitGroupList",
//   checkUserStatus.userStatus,
  groupController.getSplitGroupList
);

router.put(
  "/leftGroup",
//   checkUserStatus.userStatus,
  groupController.leftGroup
);
router.delete(
  "/deleteGroup",
//   checkUserStatus.userStatus,
  groupController.deleteGroup
);

router.get(
  "/informationOfGroup",
//   checkUserStatus.userStatus,
  groupController.informationOfGroup
);

router.get(
  "/getPaymentMethod",
//   checkUserStatus.userStatus,
  groupController.getPaymentMethod
);

module.exports = router;
