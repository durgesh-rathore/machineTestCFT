var express = require("express");
var gift = require("../controllers/gift");
var checkUserStatus = require("../config/checkUserStatus");

var router = express.Router();

router.get("/productSearchOfSearch", gift.productSearchOfSearch);
router.get("/categorySearchOfSearch", gift.categorySearchOfSearch);
router.get("/categoryAccordingToG", gift.categoryAccordingToG);
router.get("/productDetails", gift.productDetails);




module.exports = router;
