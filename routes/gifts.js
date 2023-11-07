var express = require("express");
var gift = require("../controllers/gift");
var checkUserStatus = require("../config/checkUserStatus");

var router = express.Router();

router.get("/followUser", gift.searchGift);

module.exports = router;
