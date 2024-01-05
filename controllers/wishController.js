var jwt = require("jsonwebtoken");
var connection = require("../config/db");
var constants = require("../config/constants");
var  gift=require("./gift");
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
  const { folder_name, user_id, ASIN_product_ids,icon } = req.body;
  try {
    var wishList = {
      user_id: user_id,
      folder_name: folder_name,
      icon:icon
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
                console.log(ASIN_product_ids, "wilish item or products ");
                var poroductList = ASIN_product_ids;
                // poroductList.push(req.body.group_admin_id);
                // poroductList.forEach(async (element) => {
                //   var wish_list_product = {
                //     parent_id: wishList.insertId,
                //     ASIN_product_id: element,
                //     user_id: user_id,
                //   };
                //   await save("wish_list", wish_list_product);
                //   console.log("wish_list======", wish_list_product);
                //   group_users = {};
                // });

                return res.json({
                  success: true,
                  response: { wishList_id: wishList.insertId },
                  message: "Wishlist created successfully.",
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
exports.getWishList = function (req, res) {
const {user_id,search,page}=req.query;


var searchCondition =
    search != "" &&
    search != undefined &&
    search != null;
  
    var condition=" ";
   var page1 = page ? page : 0;
  if (searchCondition) {
  
       condition = '  AND (wish_list.folder_name LIKE "%' + search + '%") ';
  }


  connection.query(
    `SELECT wish_list.*, 
            (SELECT COUNT(id) FROM  wish_list  as wl WHERE wl.parent_id=wish_list.id  ) AS total_item ,
             
            icons.icon AS icon
    FROM wish_list 
    LEFT JOIN icons
        ON icons.id=wish_list.icon
    WHERE  wish_list.parent_id IS NULL  AND wish_list.user_id='${user_id}'  ${condition} 
    ORDER BY wish_list.id DESC 
    Limit ${page1 * 10},10`,
    async function (err,wishList) {
      if (err){
         console.log(err);
         return res.json({
          success: false,
          message: "Something went wrong.",
        });
      }else
      if (wishList.length > 0) {

        connection.query(
          `SELECT COUNT(id) AS wishListCount FROM wish_list WHERE  parent_id IS NULL  AND user_id='${user_id}'  ${condition}  `,
          async function (err,wishListCount) {

        return res.json({
          success: true,
          response:wishList,
          count:wishListCount[0].wishListCount,
          message: "Wishlist.",
        });
      })
      } else {
        return res.json({
          success: false,
          response:[],
          count:0,
          message: "Wishlist.",
        });
      }
    }
  );
};
exports.getWishListItems = function (req, res) {
  const {folder_id,user_id,page}=req.query;
  var page1=0;
   if(page>=1){
     page1=page*4
    }
    connection.query(

      ` SELECT GROUP_CONCAT(ASIN_product_id) AS productsId 
            FROM ( SELECT ASIN_product_id 
                FROM wish_list 
                     WHERE  parent_id =${folder_id}  
                ORDER BY wish_list.id DESC
                LIMIT ${page1},4 ) AS subquery`,
      async function (err,wishList) {
        if (err){
           console.log(err);
           return res.json({
            success: false,
            message: "Something went wrong.",
          });
        }else
        if ( wishList.length > 0 && wishList[0].productsId && wishList[0].productsId!="null") {

        var wishList1=await  gift.getProductDetails(wishList[0].productsId,req, res)
        console.log(wishList1);
          
      }else{
        return res.json({
              success: false,
              response:[],
              message: "Wishlist.",
            });
      }
    }
    );
  };

  exports.addItemInWishList = function (req, res) {
    console.log("===========", req.body);
    const { folder_id, user_id, ASIN_product_id } = req.body;
    try {
      // for( let a of folder_ids)
      connection.query(
        `SELECT * FROM wish_list WHERE   parent_id='${folder_id}'  AND ASIN_product_id='${ASIN_product_id}'`,
        async function (err, presentWishList) {
          if (err) console.log(err);
          if (presentWishList.length == 0) {
            var wish_list_product = {
              parent_id:folder_id,
              ASIN_product_id: ASIN_product_id,
              user_id: user_id,
            };
            await save("wish_list", wish_list_product);
            return res.json({
              success: true,
              message: "Product has been added to wish list.",
            });
          } else {
            return res.json({
              success: false,
              message: "Product already added in wishlist .",
            });
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  };


  exports.icons= function(req,res) {
    var sql=`SELECT * FROM icons`;
   
    connection.query(sql,     
      function (err, categoryData) {
        console.log(err);    
        return res.json({
          response: categoryData,
          success: true,
          message: "icons List  .",
        });
      })
     
  }


  exports.removeProductFromWishList = function (req, res) {
    console.log("===========", req.body);
    const {  user_id, ASIN_product_id,folder_id } = req.body;
    try {
             connection.query(
              `DELETE FROM wish_list WHERE user_id=${user_id}  AND ASIN_product_id='${ASIN_product_id}'`,
                async function (err, wishList) {
                if (err) {console.log(err);
                  return res.json({
                    success: false,
                    message: "Something went wrong.",
                  });
                }else
                if (wishList) {                
                  return res.json({
                    success: true,
                    message: "Deleted item from wishlist.",
                  });
                } else {
                  return res.json({
                    success: false,
                    message: "Something went wrong.",
                  });
                }
              }
            );
   
    } catch (error) {
      console.error(error);
    }
  };








  
  // const express = require('express');
const ogs = require('open-graph-scraper');

// const app = express();
// const PORT = 3000;
exports.metadata = async function (req, res) {
//  (req, res) => {
  const postId = req.query.id;

  const htmlContent = generateHtmlContent("http://3.18.242.37:4000/images/postImage/image_cropper_1702894004408jpg-1702894011693.jpg", "durgehs", "durgehs");



  // Replace this with your logic to fetch content based on postId
  const post = await fetchPostById(postId);

  // If the post is found, generate Open Graph meta tags
  if (post) {
    const ogTags = generateOpenGraphTags(post);
    res.send(ogTags);
  } else {
    res.status(404).send('Post not found');
  }
};

// Function to simulate fetching a post from a database
async function fetchPostById(postId) {
  // Replace this with your logic to fetch content based on postId
  // This is a placeholder, you might fetch the data from a database or another source
  return {
    title: `Post ${postId} Title`,
    description: `This is the description for post ${postId}.`,
    image: 'http://3.18.242.37:4000/images/postImage/image_cropper_1702894004408jpg-1702894011693.jpg',
  };
}

// Function to generate Open Graph meta tags
function generateOpenGraphTags(post) {
  return `
    <html>
      <head>
        <meta property="og:title" content="${post.title}" />
        <meta property="og:description" content="${post.description}" />
        <meta property="og:image" content="${post.image}" />
        <meta property="og:url" content="https://www.yourwebsite.com/shareable-content?id=${post}" />
        <!-- Other Open Graph tags as needed -->
      </head>
      <body>
        <!-- Your page content goes here -->
      </body>
    </html>
  `;
}



function generateHtmlContent(imageUrl, name, description) {
  return `
    <html>
      <head>
        <meta property="og:title" content="${name}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:image" content="${imageUrl}" />
        <!-- Other Open Graph tags as needed -->
      </head>
      <body>
        <img src="${imageUrl}" alt="${name}" style="max-width: 100%;" />
        <h1>${name}</h1>
        <p>${description}</p>
      </body>
    </html>
  `;
}
