var express = require("express");
var wishController = require("../controllers/wishController");
var checkUserStatus = require("../config/checkUserStatus");

var router = express.Router();

router.post("/createWishList",  wishController.createWishList);
router.get("/getWishList",  wishController.getWishList);
router.get("/getWishListItems",  wishController.getWishListItems);
router.post("/addItemInWishList",  wishController.addItemInWishList);
router.get("/icons",  wishController.icons);




module.exports = router;
