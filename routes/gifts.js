var express = require("express");
var gift = require("../controllers/gift");
var checkUserStatus = require("../config/checkUserStatus");

var router = express.Router();

router.get("/amazonProductList", gift.amazonProductList);
router.get("/amazonCategoryList", gift.amazonCategoryList);

router.get("/productDetails", gift.productDetails);
router.get("/categoryAccordingToG", gift.categoryAccordingToG);




module.exports = router;
