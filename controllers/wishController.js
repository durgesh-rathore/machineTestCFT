var jwt = require("jsonwebtoken");
var connection = require("../config/db");
var constants = require("../config/constants");

var {
  save,
  findByIdAndUpdate,
  findOne,
  pushNotification1,
  pushNotification,
  addWatermarkToImage,
} = require("../helpers/helper");

var multer = require("multer");
const path = require("path");
const fs = require("fs");
const e = require("cors");

var a =
  "CASE WHEN users.profile_picture IS NOT NULL THEN CONCAT('" +
  constants.BASE_URL +
  "images/profiles/',users.profile_picture)  ELSE '' END AS profile_picture";

  exports.createWishList=function (req, res) {
    
  }
  exports.Wishlist=function (req, res) {}


