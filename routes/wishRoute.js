var express = require("express");
var wishController = require("../controllers/wishController");
var checkUserStatus = require("../config/checkUserStatus");

var router = express.Router();

router.post("/createWishList",  wishController.createWishList);
router.post("/Wishlist",  wishController.Wishlist);


module.exports = router;
