var express = require("express");
var { uploadFiles } = require("../config/custom");
var messagesController = require("../controllers/messages.js");
var checkUserStatus = require("../config/checkUserStatus");
var router = express.Router();

router.post(
  "/sendMessage",
  checkUserStatus.userStatus,
  messagesController.sendMessage
);
router.post(
  "/sendFiles",
  // checkUserStatus.userStatus,
  uploadFiles("public/images/chatImages").array("files"),
  messagesController.sendFiles
);
router.get(
  "/getDirectMessages",
  // checkUserStatus.userStatus,
  messagesController.getDirectMessages
);
router.get(
  "/getChats",
  checkUserStatus.userStatus,
  messagesController.getChats
);

router.get(
  "/getChats2",
    messagesController.getChats2
);

router.get(
  "/getSpiltChats",
//   checkUserStatus.userStatus,
  messagesController.getSpiltChats
);

router.get(
  "/messagesSeen",
//   checkUserStatus.userStatus,
  messagesController.messagesSeen
);



module.exports = router;
