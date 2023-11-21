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

exports.createWishList = function (req, res) {
  console.log("===========", req.body);
  const { folder_name, user_id, ASIN_product_ids } = req.body;
  try {
    var wishList = {
      user_id: user_id,
      folder_name: folder_name,
    };
    connection.query(
      `SELECT * FROM wish_list WHERE  parent_id IS NULL AND folder_name='${folder_name}'  AND user_id='${user_id}'`,
      async function (err, presentWishList) {
        if (err) console.log(err);
        if (presentWishList.length > 0) {
          return res.json({
            success: true,
            message: "Wishlist title  already exist.",
          });
        } else {
          connection.query(
            "INSERT INTO wish_list SET ?",
            wishList,
            async function (err, wishList) {
              if (err) console.log(err);
              if (wishList) {
                console.log(ASIN_product_id, "group_members ");
                var poroductList = ASIN_product_id.split(",");
                // poroductList.push(req.body.group_admin_id);
                poroductList.forEach(async (element) => {
                  var wish_list_product = {
                    parent_id: wishList.insertId,
                    ASIN_product_id: element,
                    user_id: user_id,
                  };
                  await save("wish_list", wish_list_product);
                  console.log("wish_list======", wish_list_product);
                  group_users = {};
                });

                return res.json({
                  success: true,
                  response: { wishList_id: wishList.insertId },
                  message: "Wish list  created successful.",
                });
              } else {
                return res.json({
                  success: false,
                  message: "Something went wrong.",
                });
              }
            }
          );
        }
      }
    );
  } catch (error) {
    console.error(error);
  }
};
exports.Wishlist = function (req, res) {
const {user_id}=req.query;
  connection.query(
    `SELECT * FROM wish_list WHERE  parent_id IS NULL  AND user_id='${user_id}'`,
    async function (err,wishList) {
      if (err) console.log(err);
      if (wishList.length > 0) {
        return res.json({
          success: true,
          message: "Wishlist title  already exist.",
        });
      } else {
      }
    }
  );
};
