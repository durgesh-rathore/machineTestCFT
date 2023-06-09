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

  console.log("req.query===",req.query);
  var sql='';
  var page = req.query.page ? req.query.page : 0;
  if (
    req.query.user_id != "" &&
    req.query.user_id != undefined &&
    req.query.user_id != null && req.query.is_group==0
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
  if (req.query.is_group==1) {
    sql =
      "SELECT chats.*,CONCAT('" +
      constants.BASE_URL +
      "','images/profiles/',users.profile_picture) AS profile_picture,users.name,case when chats.images IS NOT NULL then chats.images   else ''  end AS images FROM `chats` LEFT JOIN users ON users.id=chats.send_by WHERE chats.sent_to=" +
      req.query.user_id +
      " ORDER BY chats.id DESC  Limit " +
      page * 30 +
      ",30";
  }

  connection.query(sql, function (err, chatList) {
    console.log(err, chatList);
    if (chatList.length > 0) {
      
      function parseImagesSync(chatList, index, callback) {
  if (index < chatList.length) {
    const chatItem = chatList[index];
    if (chatItem.images != null && chatItem.images !== '' && chatItem.images !== undefined) {
      chatItem.images = JSON.parse(chatItem.images);
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

// exports.getDirectMessages = async (req, res) => {
//   var page = req.query.page ? req.query.page : 0;

//   var search1 = " ";
//   var search2 = " ";
//   if (
//     req.query.search != "" &&
//     req.query.search != undefined &&
//     req.query.search != null
//   ) {
//     search1 = '  AND (users.name LIKE "%' + req.query.search + '%") ';

//     search2 =
//       ' AND ( groups1.type LIKE "%' +
//       req.query.search +
//       '%" OR groups1.name LIKE "%' +
//       req.query.search +
//       '%") ';
//   }

//   sql =
//     "SELECT n1.id,n1.created_datetime,CASE WHEN n1.group_id IS NOT NULL THEN 1  ELSE 0 END AS is_group,users.name ," +
//     a +
//     " , users.id AS user_id,groups1.id AS group_id,groups1.name AS group_name,groups1.type AS group_type   ,(SELECT COUNT(*) FROM chats WHERE chats.sent_to=n1.sent_to AND send_by=n1.send_by AND chats.is_seen=0) AS newMessageCount   ,(SELECT TIMESTAMPDIFF(MINUTE, chats.created_datetime , CURRENT_TIMESTAMP)  FROM chats WHERE (chats.sent_to=n1.sent_to OR chats.group_id=n1.group_id) AND send_by=n1.send_by  ORDER BY chats.created_datetime DESC LIMIT 1) AS last_times_user_in,   CASE WHEN n1.group_id IS  NULL THEN (SELECT chats.message  FROM chats WHERE (chats.sent_to=n1.sent_to OR chats.group_id=n1.group_id) AND send_by=n1.send_by  ORDER BY chats.created_datetime DESC LIMIT 1) END AS last_times_user_message , CASE WHEN n1.group_id IS NOT NULL THEN     (SELECT GROUP_CONCAT(users.profile_picture) FROM chats LEFT JOIN users ON users.id=chats.send_by WHERE chats.group_id=n1.group_id)  END   AS group_users_image FROM `chats` AS n1    LEFT JOIN chats n2 ON n2.group_id=n1.group_id     LEFT JOIN groups_users ON groups_users.group_id=n1.group_id       LEFT JOIN groups1 ON groups1.id=n1.group_id      LEFT JOIN users ON users.id=n1.send_by     WHERE ( n1.sent_to=" +
//     req.query.login_user_id +
//     search1 +
//     " ) OR (groups_users.user_id=" +
//     req.query.login_user_id +
//     search2 +
//     ") AND n1.id!=n2.id AND (n1.id>n2.id OR n2.id is null   )  GROUP BY n1.sent_to,n1.group_id Limit " +
//     page * 8 +
//     ",8";

//   console.log("sql.....................................", sql, "===sql===");
//   connection.query(sql, function (err, directMessages) {
//     console.log(err, directMessages);
//     var sqlCountsDM =
//       "SELECT n1.id FROM `chats` AS n1    LEFT JOIN chats n2 ON n2.group_id=n1.group_id     LEFT JOIN groups_users ON groups_users.group_id=n1.group_id       LEFT JOIN groups1 ON groups1.id=n1.group_id      LEFT JOIN users ON users.id=n1.send_by     WHERE ( n1.sent_to=" +
//       req.query.login_user_id +
//       search1 +
//       " ) OR (groups_users.user_id=" +
//       req.query.login_user_id +
//       search2 +
//       ") AND n1.id!=n2.id AND (n1.id>n2.id OR n2.id is null   )  GROUP BY n1.send_by,n1.sent_to ";

//     var sqlCountsSplit =
//       "SELECT COUNT(*) AS counts FROM users AS users2 LEFT JOIN billing_group ON billing_group.group_id=users2.id  LEFT JOIN billing_group_users ON billing_group_users.group_id=billing_group.group_id  LEFT JOIN users AS user1 ON user1.id=billing_group_users.user_id  WHERE user1.id=" +
//       req.query.login_user_id;

//     connection.query(sqlCountsSplit, function (err, sqlCountsSplitResult) {
//       if (err) {
//         console.log(err);
//       }

//       connection.query(sqlCountsDM, function (err, sqlCountsDMResult) {
//         if (err) {
//           console.log(err);
//         }

//         if (directMessages.length > 0) {
          

//           return res.json({
//             response: directMessages,
//             DMCounts: sqlCountsDMResult.length,
//             splitCount: sqlCountsSplitResult[0].counts,

//             success: true,
//             message: "Direct message list",
//           });
//         } else {
//           return res.json({
//             response: [],
//             DMCounts: sqlCountsDMResult,
//             splitCount: sqlCountsSplitResult[0].counts,
//             success: true,
//             message: "No More post",
//           });
//         }
//       });
//     });
//   });
// };
exports.getDirectMessages = async (req, res) => {
  var page = req.query.page ? req.query.page : 0;

  var search = " ";
  
  if (
    req.query.search != "" &&
    req.query.search != undefined &&
    req.query.search != null
  ) {
    search = '  AND (users.name LIKE "%' + req.query.search + '%" OR users.type LIKE "%' + req.query.search + '%" ) ';

   
  }
var sql="SELECT chats.*,gf.is_group,gf.type,CASE WHEN gf.is_group=1 THEN gf.id ELSE ou.id END AS user_id,CASE WHEN gf.is_group!=0 THEN gf.type ELSE '' END AS group_type, CASE WHEN gf.is_group=0 THEN ou.name ELSE '' END AS name,(SELECT COUNT(*) FROM chats WHERE chats.send_by=ou.id AND is_seen=0 ) AS newMessageCount  , CASE WHEN gf.is_group!=0 THEN gf.name ELSE '' END AS group_name,CASE WHEN gf.is_group=1  THEN     (SELECT GROUP_CONCAT(users.profile_picture) FROM users LEFT JOIN groups_users ON groups_users.user_id=users.id WHERE groups_users.group_id= gf.id )  END   AS group_users_image,CASE WHEN gf.is_group=0  THEN (  CASE WHEN ou.profile_picture IS NOT NULL THEN CONCAT('" +
constants.BASE_URL +
"images/profiles/',ou.profile_picture)  ELSE '' END ) ELSE '' END AS profile_picture,(SELECT TIMESTAMPDIFF(MINUTE, chats.created_datetime , CURRENT_TIMESTAMP)  FROM chats WHERE (chats.sent_to=gf.id)   ORDER BY chats.created_datetime DESC LIMIT 1) AS last_times_user_in FROM `chats` LEFT JOIN users AS gf ON gf.id=chats.sent_to LEFT JOIN groups_users  gu ON  gu.group_id=gf.id LEFT JOIN users  ou ON  ou.id=send_by WHERE (sent_to=" +
req.query.login_user_id +" OR gu.user_id="+
req.query.login_user_id +")"+ search+ "  GROUP BY chats.sent_to, ( case when chats.is_group=1 then chats.is_group else chats.send_by  end )  Limit " +
page * 10 +
",10 ";

  console.log("sql.....................................", sql, "===sql===");
  connection.query(sql, function (err, directMessages) {
    console.log(err, directMessages);
    var sqlCountsDM =
    "SELECT chats.id FROM `chats` LEFT JOIN users AS gf ON gf.id=chats.sent_to LEFT JOIN groups_users  gu ON  gu.group_id=gf.id LEFT JOIN users  ou ON  ou.id=send_by WHERE (sent_to=" +
    req.query.login_user_id +" OR gu.user_id="+
    req.query.login_user_id +")"+ search+ " GROUP BY chats.sent_to, ( case when chats.is_group=1 then chats.is_group else chats.send_by  end )"
    // console.log("sqlCountsDM===",sqlCountsDM);

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
    var images = [];
    if (req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        images.push(req.files[i].filename);
      }
      data.images = JSON.stringify(images);
    }else{
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
        response:{ chat_images:images},
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
      "SELECT billing_group.id,billing_group.spliting_amount,billing_group.name,( SELECT GROUP_CONCAT(users.profile_picture) FROM users LEFT JOIN billing_group_users ON billing_group_users.user_id=users.id WHERE billing_group_users.group_id=billing_group.id AND billing_group_users.user_id!=" +
      req.query.login_user_id +
      "  ) AS group_users_image,(select sum( case when billing_group_users.payment_amount IS NOT NULL then billing_group_users.payment_amount else 0 end )/COUNT(*)  from `billing_group_users` WHERE billing_group_users.group_id=billing_group.id ) AS percentage  FROM billing_group  LEFT JOIN billing_group_users ON billing_group_users.group_id=billing_group.id  LEFT JOIN users ON users.id=billing_group_users.user_id     WHERE users.id=" +
      req.query.login_user_id;

    console.log("ssq1========", sql1);
  }

  if (req.query.group_id) {
    sql2 =
      "SELECT bgc.chat_message,bgc.image FROM billing_group_chat AS bgc WHERE bgc.billing_group_id=" +
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
            response: { chatList: chatList, splitDetails: splitDetails },
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
