var connection = require("../config/db");
var constants = require("../config/constants");
var { encryptPassword, checkPassword } = require("../config/custom");
var { save, findByIdAndUpdate } = require("../helpers/helper");

var multer = require("multer");
const path = require("path");
const fs = require("fs");

var a =
  "CASE WHEN users.profile_picture IS NOT NULL THEN CONCAT('" +
  constants.BASE_URL +
  "images/profiles/',users.profile_picture)  ELSE '' END AS profile_picture";
exports.getChats = async (req, res) => {
  console.log("req.query===", req.query);
  var sql = "";
  var page = req.query.page ? req.query.page : 0;
  if (
    req.query.user_id != "" &&
    req.query.user_id != undefined &&
    req.query.user_id != null &&
    req.query.is_group == 0
  ) {
    sql =
      "SELECT chats.*,case when chats.images IS NOT NULL then chats.images   else ''  end AS images, CONCAT('" +
      constants.BASE_URL +
      "','images/profiles/',users.profile_picture) AS profile_picture,users.name FROM `chats` LEFT JOIN users ON users.id=chats.send_by WHERE chats.send_by IN(" +
      req.query.login_user_id +
      "," +
      req.query.user_id +
      ") AND chats.sent_to IN(" +
      req.query.login_user_id +
      "," +
      req.query.user_id +
      ") ORDER BY chats.id DESC Limit " +
      page * 30 +
      ",30";
  }
  if (req.query.is_group == 1) {
    sql =
      "SELECT chats.*,CONCAT('" +
      constants.BASE_URL +
      "','images/profiles/',users.profile_picture) AS profile_picture,users.name,case when chats.images IS NOT NULL then chats.images   else ''  end AS images FROM `chats` LEFT JOIN users ON users.id=chats.send_by WHERE chats.sent_to=" +
      req.query.user_id +
      " ORDER BY chats.id DESC  Limit " +
      page * 30 +
      ",30";
  }

  // const numbers = [65, 44, 12, 4];
  // const newArr = numbers.map(myFunction)

  connection.query(sql, function (err, chatList) {
    console.log(err, chatList);
    if (chatList.length > 0) {
      function parseImagesSync(chatList, index, callback) {
        if (index < chatList.length) {
          const chatItem = chatList[index];
          if (
            chatItem.images != null &&
            chatItem.images !== "" &&
            chatItem.images !== undefined
          ) {
            chatItem.images = JSON.parse(chatItem.images);
            const imageArray = chatItem.images.map(myFunction);
            function myFunction(image) {
              return constants.BASE_URL + "images/chatImages/" + image;
            }
            chatItem.images = imageArray;
          }else{
            chatItem.images=[];
          }
          parseImagesSync(chatList, index + 1, callback);
        } else {
          callback();
        }
      }

      function processChatList(chatList) {
        parseImagesSync(chatList, 0, () => {
          // Perform any further operations on the chatList
          console.log(chatList);
        });
      }

      processChatList(chatList);
      return res.json({
        response: chatList,
        success: true,
        message: "Chat list",
      });
    } else {
      return res.json({
        response: [],
        success: false,
        message: "No More chats",
      });
    }
  });
};


exports.getDirectMessages = async (req, res) => {
  var page = req.query.page ? req.query.page : 0;

  var search = " ";

  if (
    req.query.search != "" &&
    req.query.search != undefined &&
    req.query.search != null
  ) {
    search =
      '  AND (users.name LIKE "%' +
      req.query.search +
      '%" OR users.type LIKE "%' +
      req.query.search +
      '%" ) ';
  }
  


    sql="SELECT users.is_group,users.type AS group_type,CASE WHEN users.profile_picture IS NOT NULL THEN CONCAT('http://192.168.0.164:3000/images/profiles/',users.profile_picture)  ELSE '' END AS profile_picture,users.name,users.id, (SELECT  COUNT(users_requests.request_for) FROM users_requests WHERE users_requests.is_follow!=0  AND users_requests.request_for=users.id ) AS followed_by ,   (SELECT TIMESTAMPDIFF(MINUTE, chats.created_datetime , CURRENT_TIMESTAMP)  FROM chats WHERE (chats.sent_to=users.id)   ORDER BY chats.created_datetime DESC LIMIT 1) AS last_times_user_in ,(SELECT  chats.message  FROM chats WHERE (chats.sent_to=users.id)   ORDER BY chats.created_datetime DESC LIMIT 1) AS message ,  CASE WHEN users.is_group=1  THEN    (SELECT GROUP_CONCAT(users1.profile_picture) FROM users AS users1 LEFT JOIN groups_users ON groups_users.user_id=users1.id WHERE groups_users.group_id= users.id  )  END   AS group_users_image,CASE WHEN users.is_group=0  THEN (  CASE WHEN users.profile_picture IS NOT NULL THEN CONCAT('" +
    constants.BASE_URL +
    "images/profiles/',users.profile_picture)  ELSE '' END ) ELSE '' END AS profile_picture,CASE WHEN users.is_group=0  THEN (SELECT COUNT(*) FROM chats WHERE chats.send_by=users.id AND is_seen=0 ) ELSE 0 END AS newMessageCount FROM users LEFT JOIN users_requests ON (   users.id =  case when users_requests.user_id!=" +
    req.query.login_user_id +
    " Then users_requests.user_id ELSE users_requests.request_for END)  LEFT JOIN groups_users ON groups_users.group_id= users.id WHERE  ( (users_requests.user_id='"+req.query.login_user_id +"' OR users_requests.request_for='"+req.query.login_user_id +"') AND ( users_requests.is_follow=1 AND users_requests.is_reject=0 AND users_requests.is_block=0 AND users_requests.is_accepted=1 )  OR (users.is_group=1 AND groups_users.user_id='"+req.query.login_user_id +"')  )  AND users.id <> '"+req.query.login_user_id +"' "  + search + "  GROUP BY users.id     limit  "+ (page * 10) +
    ",10 ";

  console.log("sql.....................................", sql, "===sql===");

  connection.query(sql, function (err, directMessages) {
    console.log(err, directMessages);
  

    var sqlCountsDM= "  SELECT COUNT(*) AS counts FROM users LEFT JOIN users_requests ON (   users.id =  case when users_requests.user_id!=1 Then users_requests.user_id ELSE users_requests.request_for END)  LEFT JOIN groups_users ON groups_users.group_id= users.id WHERE  ( (users_requests.user_id='"+req.query.login_user_id +"' OR users_requests.request_for='"+req.query.login_user_id +"') AND ( users_requests.is_follow=1 AND users_requests.is_reject=0 AND users_requests.is_block=0 AND users_requests.is_accepted=1 )  OR (users.is_group=1 AND groups_users.user_id='"+req.query.login_user_id +"')   )  AND users.id <> '"+req.query.login_user_id +"' "  + search + "  GROUP BY users.id    "

    var sqlCountsSplit =
      "SELECT COUNT(*) AS counts FROM users AS users2 LEFT JOIN billing_group ON billing_group.group_id=users2.id  LEFT JOIN billing_group_users ON billing_group_users.group_id=billing_group.group_id  LEFT JOIN users AS user1 ON user1.id=billing_group_users.user_id  WHERE user1.id=" +
      req.query.login_user_id;

    connection.query(sqlCountsSplit, function (err, sqlCountsSplitResult) {
      if (err) {
        console.log(err);
      }

      connection.query(sqlCountsDM, function (err, sqlCountsDMResult) {
        if (err) {
          console.log(err);
        }
        console.log(sqlCountsDM,"==========directemesage========");

        if (directMessages.length > 0) {
          return res.json({
            response: directMessages,
            DMCounts: sqlCountsDMResult.length,
            splitCount: sqlCountsSplitResult[0].counts,

            success: true,
            message: "Direct message list",
          });
        } else {
          return res.json({
            response: [],
            DMCounts: sqlCountsDMResult.length,
            splitCount: sqlCountsSplitResult[0].counts,
            success: true,
            message: "No More post",
          });
        }
      });
    });
  });
};

exports.sendMessage = async (req, res) => {
  if (!req.body.login_user_id) {
    return res.status(400).json({ message: "Missing some data" });
  } else {
    var data = {
      send_by: req.body.login_user_id,
    };
    if (req.body.user_id) {
      data.sent_to = req.body.user_id;
    }
    if (req.body.message) {
      data.message = req.body.message;
    }

    var c = await save("chats", data);
    console.log("c====", c);
    if (c) {
      return res.json({ success: true, message: "sent." });
    } else {
      return res.json({ success: false, message: "something went wrong" });
    }
  }
};
exports.sendFiles = async (req, res) => {
  if (!req.body.login_user_id) {
    return res.status(400).json({ message: "Missing some data" });
  } else {
    var data = {
      send_by: req.body.login_user_id,
        
    };
    if (req.body.user_id) {
      data.sent_to = req.body.user_id;
    }
    if (req.body.is_group) {
      data.is_group = req.body.is_group;
    }
    
    var images = [];
    var images2 = [];
    if (req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        images.push(req.files[i].filename);
        images2.push(
          constants.BASE_URL + "images/chatImages/" + req.files[i].filename
        );
      }
      data.images = JSON.stringify(images);
    } else {
      return res.json({
        success: false,
        message: " Please select image.",
      });
    }
    console.log("============", data.images);

    var c = await save("chats", data);
    console.log("c====", c);
    if (c) {
      return res.json({
        success: true,
        message: " file sent.",
        response: { chat_images: images2 },
      });
    } else {
      return res.json({ success: false, message: "something went wrong" });
    }
  }
};


exports.getSpiltChats = async (req, res) => {
  var page = req.query.page ? req.query.page : 0;
  var sql1 = " ";
  var sql2 = " ";
  if (
    req.query.login_user_id != "" &&
    req.query.login_user_id != undefined &&
    req.query.login_user_id != null &&
    req.query.group_id
  ) {
    sql1 =
      "SELECT users.name, billing_group.group_id,billing_group.spliting_amount,( SELECT GROUP_CONCAT(users.profile_picture) FROM users LEFT JOIN billing_group_users ON billing_group_users.user_id=users.id WHERE billing_group_users.group_id=billing_group.group_id AND billing_group_users.user_id!=" +
      req.query.login_user_id +
      "  ) AS group_users_image,(select sum( case when billing_group_users.payment_amount IS NOT NULL then billing_group_users.payment_amount else 0 end )/COUNT(*)  from `billing_group_users` WHERE billing_group_users.group_id=billing_group.group_id ) AS percentage,(select  billing_group.spliting_amount/COUNT(*)  from `billing_group_users` WHERE billing_group_users.group_id=billing_group.group_id ) AS each_split   FROM billing_group  LEFT JOIN billing_group_users ON billing_group_users.group_id=billing_group.group_id  LEFT JOIN users ON users.id=billing_group_users.group_id     WHERE billing_group_users.group_id=" +
      req.query.group_id +" GROUP BY users.id" ;

    console.log("ssq1========", sql1);
  }

  if (req.query.group_id) {
    sql2 =
      "SELECT bgc.* FROM chats AS bgc WHERE bgc.sent_to=" +
      req.query.group_id +
      " ORDER BY bgc.created_datetime Limit " +
      page * 8 +
      ",8";
  }
  console.log("sql1=================", sql1);
  console.log("sql2=================", sql2);

  connection.query(sql1, function (err, splitDetails) {
    console.log(err, splitDetails);

    if (splitDetails.length > 0) {
      connection.query(sql2, function (err, chatList) {
        console.log(err, chatList);

        if (chatList.length > 0) {
          return res.json({
            response: { chatList: chatList, splitDetails: splitDetails[0] },
            success: true,
            message: "Chat list",
          });
        } else {
          return res.json({
            response: { chatList: [], splitDetails: splitDetails },
            success: true,
            // message: "",
          });
        }
      });
    } else {
      return res.json({
        response: [],
        success: false,
        message: "No More chats",
      });
    }
  });
};

