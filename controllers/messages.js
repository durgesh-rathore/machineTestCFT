var connection = require("../config/db");
var constants = require("../config/constants");
var { encryptPassword, checkPassword } = require("../config/custom");
const { db_sql, dbScript, queryAsync } = require("../helpers/db_scripts");
var { save, findByIdAndUpdate } = require("../helpers/helper");

var multer = require("multer");
const path = require("path");
const fs = require("fs");
// const fetch = require('node-fetch');
const axios = require("axios");
// import fetch from "node-fetch";

var a =
  "CASE WHEN users.profile_picture IS NOT NULL THEN CONCAT('" +
  constants.BASE_URL +
  "images/profiles/',users.profile_picture)  ELSE '' END AS profile_picture";
exports.getChats = async (req, res) => {
  //  i have to write logic for
  // sql1= `UPDATE chats SET is_seen = 1 WHERE is_seen=0 AND chats.sent_to = ${}`;
  const { login_user_id, user_id, is_group, search } = req.query;

  console.log("req.query===", req.query);
  var sql = "";
  var page = req.query.page ? req.query.page : 0;
  var condition = " ";
  var dd = " ";
  var searchCondition =
    req.query.search != "" &&
    req.query.search != undefined &&
    req.query.search != null;
  var condition2 = "";
  console.log(searchCondition, " ===searchCondition");
  if (searchCondition) {
    dd =
      ' CASE  WHEN chats.message LIKE "%' +
      req.query.search +
      '%"  THEN 1    ELSE 0  END AS match_status, ';

    condition = '  AND (chats.message LIKE "%' + req.query.search + '%") ';
    //  Sigle User Chats
  } else {
    dd =
      " CASE  WHEN chats.images IS NOT NULL then 0   else 0  end AS match_status, ";
  }

  if (req.query.is_group != 1 && req.query.is_group != 2) {
    console.log(condition, "  ==========dddddddd condition ");
    if (searchCondition) {
      let s6 = await dbScript(db_sql["Q6"], {
        var1: login_user_id,
        var2: user_id,
        var3: condition,
      });
      console.log(s6, condition, "  ==========dddddddd");
      // group user seen chat yet here
      let chatSearch = await queryAsync(s6);

      if (chatSearch.length > 0) {
        condition2 = "  AND chats.id <=" + chatSearch[0].id;
      } else {
        return res.json({
          response: [],
          success: false,
          message: "No match record found.",
        });
      }
    }

    // sql =
    //   `SELECT chats.*,${
    //   dd }  CASE WHEN chats.images IS NOT NULL then chats.images   else ''  end AS images, CONCAT('${
    //   constants.BASE_URL }','images/profiles/',users.profile_picture) AS profile_picture,users.name FROM chats LEFT JOIN users ON users.id=chats.send_by WHERE chats.send_by IN(${
    //   req.query.login_user_id },${req.query.user_id}) AND chats.sent_to IN(${req.query.login_user_id },${
    //   req.query.user_id }) ${condition2}    ORDER BY chats.id DESC Limit ${page * 30},30`;

    sql = `SELECT
              chats.*,
              ${dd}  
              CASE
                  WHEN chats.images IS NOT NULL THEN chats.images
                  ELSE ''
              END AS images,
              CONCAT('${
                constants.BASE_URL
              }','images/profiles/',users.profile_picture) AS profile_picture,
              users.name
          FROM
              chats
          LEFT JOIN
              users ON users.id = chats.send_by
          WHERE 
             chats.send_by IN(${req.query.login_user_id},${req.query.user_id})
             AND chats.sent_to IN(${req.query.login_user_id},${
      req.query.user_id
    })
             ${condition2}
          ORDER BY
              chats.id DESC
          LIMIT
             ${page * 30}, 30`;

    console.log(sql, " ======sql=== ");
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
            } else {
              chatItem.images = [];
            }
            parseImagesSync(chatList, index + 1, callback);
          } else {
            callback();
          }
        }

        function processChatList(chatList) {
          parseImagesSync(chatList, 0, () => {
            // Perform any further operations on the chatList
            // console.log(chatList);
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
  } else {
    //  Group user chat =====
    console.log(" We are in group user chat gggggggggggggggggggggg");
    if (searchCondition) {
      var sql2 = `UPDATE chats SET is_seen = 1 WHERE is_seen=0 AND chats.sent_to = chats.send_by IN(${req.query.login_user_id},
        ${req.query.user_id} ) AND chats.sent_to IN(${req.query.login_user_id},
          ${req.query.user_id} )`;

      let s7 = await dbScript(db_sql["Q7"], {
        var1: user_id,
        var2: condition,
      });
      // group user seen chat yet here
      let chatSearch = await queryAsync(s7);
      console.log(chatSearch, " ======ffffffffffffffffff==");

      if (chatSearch.length > 0) {
        condition2 = "  AND chats.id <= " + chatSearch[0].id;
      } else {
        return res.json({
          response: [],
          success: false,
          message: "No match record found.",
        });
      }
    }
    console.log(condition2, " condition2  for group chat===", dd);
    sql = `SELECT chats.*,${dd}  CONCAT('${
      constants.BASE_URL
    }','images/profiles/',users.profile_picture) AS profile_picture, users.name,case when chats.images IS NOT NULL then chats.images   else ''  end AS images FROM chats LEFT JOIN users ON users.id=chats.send_by WHERE chats.sent_to=${
      req.query.user_id
    }    ${condition2} ORDER BY chats.id DESC  Limit ${page * 30},30`;

    console.log(sql, " ======sql=== ");
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
            } else {
              chatItem.images = [];
            }
            parseImagesSync(chatList, index + 1, callback);
          } else {
            callback();
          }
        }

        function processChatList(chatList) {
          parseImagesSync(chatList, 0, () => {
            // Perform any further operations on the chatList
            // console.log(chatList);
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
  }
};
exports.getChats2 = async (req, res) => {
  //  i have to write logic for
  const { page1, search, login_user_id, user_id, is_group } = req.query;
  // sql1= `UPDATE chats SET is_seen = 1 WHERE is_seen=0 AND chats.sent_to = ${}`;

  console.log("req.query===", req.query);
  var sql = "";
  var page = page ? page : 0;
  var condition = " ";

  if (search != "" && search != undefined && search != null) {
    condition = '  AND (chats.message LIKE "%' + search + '%") ';
  }
  if (
    user_id != "" &&
    user_id != undefined &&
    user_id != null &&
    is_group == 0
  ) {
    sql =
      "SELECT chats.*,case when chats.images IS NOT NULL then chats.images   else ''  end AS images, CONCAT('" +
      constants.BASE_URL +
      "','images/profiles/',users.profile_picture) AS profile_picture,users.name FROM `chats` LEFT JOIN users ON users.id=chats.send_by WHERE chats.send_by IN(" +
      login_user_id +
      "," +
      user_id +
      ") AND chats.sent_to IN(" +
      login_user_id +
      "," +
      user_id +
      ") " +
      condition +
      " ORDER BY chats.id DESC Limit " +
      page * 20 +
      ",20";
  }
  if (is_group == 1 || is_group == 2) {
    let s4 = await dbScript(db_sql["Q4"], {
      var1: user_id,
      var2: login_user_id,
    });
    // group user seen chat yet here
    let csgu = await queryAsync(s4);

    if (csgu.length > 1) {
      //  Now checking after this chat is available or not
      let s5 = await dbScript(db_sql["Q5"], {
        var1: user_id,
        var2: csgu[0].to_chat_id,
      });
      let chatListdataIsEmpty = await queryAsync(s5);
      console.log(csgu[0].to_chat_id, "===============");
      sql =
        "SELECT chats.*,CONCAT('" +
        constants.BASE_URL +
        "','images/profiles/',users.profile_picture) AS profile_picture,users.name,case when chats.images IS NOT NULL then chats.images   else ''  end AS images FROM `chats` LEFT JOIN users ON users.id=chats.send_by WHERE chats.sent_to=" +
        user_id +
        " ORDER BY chats.id DESC  Limit " +
        page * 20 +
        ",20";
    } else {
      sql =
        "SELECT chats.*,CONCAT('" +
        constants.BASE_URL +
        "','images/profiles/',users.profile_picture) AS profile_picture,users.name,case when chats.images IS NOT NULL then chats.images   else ''  end AS images FROM `chats` LEFT JOIN users ON users.id=chats.send_by WHERE chats.sent_to=" +
        user_id +
        " ORDER BY chats.id DESC  Limit " +
        page * 20 +
        ",20";
    }
  }

  // const numbers = [65, 44, 12, 4];
  // const newArr = numbers.map(myFunction)

  console.log(sql, " =====sql=");
  connection.query(sql, async function (err, chatList) {
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
          } else {
            chatItem.images = [];
          }
          parseImagesSync(chatList, index + 1, callback);
        } else {
          callback();
        }
      }

      function processChatList(chatList) {
        parseImagesSync(chatList, 0, () => {
          // Perform any further operations on the chatList
          // console.log(chatList);
        });
      }

      processChatList(chatList);
      await save("chat_seen_in_group_by_user", {
        user_id: login_user_id,
        group_id: user_id,
        to_chat_id: chatList[chatList.length - 1].id,
      });
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

  // THEN CONCAT('http://192.168.0.164:3000/images/profiles/', users.profile_picture)
  sql = `SELECT
    users.is_group,
    users.type AS group_type,
    CASE
        WHEN users.profile_picture IS NOT NULL
                THEN CONCAT('${
                  constants.BASE_URL
                }','images/profiles/', users.profile_picture)
        ELSE ''
    END AS profile_picture,
    users.name,
    users.id,
    (
        SELECT COUNT(users_requests.request_for)
        FROM users_requests
        WHERE users_requests.is_follow != 0
            AND users_requests.request_for = users.id
    ) AS followed_by,
    (
        SELECT TIMESTAMPDIFF(
            MINUTE,
            chats.created_datetime,
            CURRENT_TIMESTAMP
        )
        FROM chats
        WHERE (
            chats.sent_to = ${req.query.login_user_id}
            AND chats.send_by = users.id
        )
        ORDER BY chats.created_datetime DESC
        LIMIT 1
    ) AS last_times_user_in,
    (
        SELECT chats.message
        FROM chats
        WHERE (
            chats.sent_to = ${req.query.login_user_id}
            AND chats.send_by = users.id
        )
        ORDER BY chats.created_datetime DESC
        LIMIT 1
    ) AS message,
    CASE
        WHEN users.is_group = 1
        THEN (
            SELECT GROUP_CONCAT(users1.profile_picture)
            FROM users AS users1
            LEFT JOIN groups_users ON groups_users.user_id = users1.id
            WHERE groups_users.group_id = users.id
        )
    END AS group_users_image,
    CASE
        WHEN users.is_group = 0
        THEN (
            CASE
                WHEN users.profile_picture IS NOT NULL
                THEN CONCAT('${
                  constants.BASE_URL
                }','images/profiles/', users.profile_picture)
                ELSE ''
            END
        )
        ELSE ''
    END AS profile_picture,
    CASE
        WHEN users.is_group = 0
        THEN (
            SELECT COUNT(*)
            FROM chats
            WHERE chats.send_by = users.id
                AND chats.sent_to = ${req.query.login_user_id}
                AND is_seen = 0
        )
        ELSE 0
    END AS newMessageCount,
    CASE
        WHEN users.is_group = 1
        THEN (
           SELECT GROUP_CONCAT(user_id) 
           FROM groups_users 
           WHERE  groups_users.is_muted=1 
                  AND  groups_users.group_id=users.id )
        ELSE 
          ( CASE 
              WHEN users.is_group = 0  
              THEN 
                  ( SELECT 
                       GROUP_CONCAT(mufsc.user_id) 
                    FROM mute_users_for_sigle_chat AS mufsc 
                    WHERE mufsc.is_muted=1 AND
                       (             
                          (mufsc.chat_user_id=users.id AND  mufsc.user_id=${req.query.login_user_id} ) 
                       OR
                          ( mufsc.user_id=users.id  AND mufsc.chat_user_id=${req.query.login_user_id}  ) 
                        )
                  ) 
             ELSE 0 
          END AS mute_users )
        END  AS mute_users,

    CASE
      WHEN users.is_group = 1
      THEN groups_users.is_muted
      ELSE 
         ( CASE 
             WHEN users.is_group = 0  
             THEN 
               ( SELECT mufsc.is_muted FROM mute_users_for_sigle_chat AS mufsc WHERE mufsc.chat_user_id=users.id AND mufsc.user_id=${req.query.login_user_id} )
             ELSE 0 END AS is_muted )
    END  AS is_muted
FROM
    users
LEFT JOIN users_requests ON (
        users.id = CASE
            WHEN users_requests.user_id <> ${req.query.login_user_id}
            THEN users_requests.user_id
            ELSE users_requests.request_for
        END
    )
LEFT JOIN groups_users ON groups_users.group_id = users.id
WHERE (
        (
            users_requests.user_id = ${req.query.login_user_id}
            OR users_requests.request_for = ${req.query.login_user_id}
        )
        AND (
            users_requests.is_reject = 0
            AND users_requests.is_block = 0
            AND users_requests.is_accepted = 1
        )
        OR (
            users.is_group = 1
            AND groups_users.user_id = ${req.query.login_user_id}
        )
    )
    AND users.id <> ${req.query.login_user_id}
    ${search}
GROUP BY users.id
ORDER BY users.id DESC
LIMIT ${page * 10}, 10`;

  console.log("sql.....................................", sql, "===sql===");

  connection.query(sql, function (err, directMessages) {
    console.log(err, directMessages);

    // var sqlCountsDM= "  SELECT COUNT(*) AS counts FROM users LEFT JOIN users_requests ON (   users.id =  case when users_requests.user_id!=1 Then users_requests.user_id ELSE users_requests.request_for END)  LEFT JOIN groups_users ON groups_users.group_id= users.id WHERE  ( (users_requests.user_id='"+req.query.login_user_id +"' OR users_requests.request_for='"+req.query.login_user_id +"') AND ( users_requests.is_follow=1 AND users_requests.is_reject=0 AND users_requests.is_block=0 AND users_requests.is_accepted=1 )  OR (users.is_group=1 AND groups_users.user_id='"+req.query.login_user_id +"')   )  AND users.id <> '"+req.query.login_user_id +"' "  + search + "  GROUP BY users.id    "

    sqlCountsDM =
      "SELECT  COUNT(*) AS counts  FROM users LEFT JOIN users_requests ON (   users.id =  case when users_requests.user_id<>" +
      req.query.login_user_id +
      " Then users_requests.user_id ELSE users_requests.request_for END)  LEFT JOIN groups_users ON groups_users.group_id= users.id WHERE  ( (users_requests.user_id='" +
      req.query.login_user_id +
      "' OR users_requests.request_for='" +
      req.query.login_user_id +
      "') AND ( users_requests.is_reject=0 AND users_requests.is_block=0 AND users_requests.is_accepted=1 )  OR (users.is_group=1 AND groups_users.user_id='" +
      req.query.login_user_id +
      "')  )  AND users.id <> '" +
      req.query.login_user_id +
      "' " +
      search +
      "  GROUP BY users.id ";

    // var sqlCountsSplit =
    //   "SELECT COUNT(*) AS counts FROM users AS users2 LEFT JOIN billing_group ON billing_group.group_id=users2.id  LEFT JOIN billing_group_users ON billing_group_users.group_id=billing_group.group_id  LEFT JOIN users AS user1 ON user1.id=billing_group_users.user_id  WHERE user1.id=" +
    //   req.query.login_user_id;

    var sqlCountsSplit =
      "SELECT COUNT(*) AS counts    FROM users AS users2 LEFT JOIN billing_group ON billing_group.group_id=users2.id  LEFT JOIN billing_group_users ON billing_group_users.group_id=billing_group.group_id  LEFT JOIN users AS user1 ON user1.id=billing_group_users.user_id  WHERE users2.is_group=2 AND billing_group_users.user_id=" +
      req.query.login_user_id +
      " AND YEAR(billing_group.event_date) = YEAR(CURDATE()) AND MONTH(billing_group.event_date) = MONTH(CURDATE())   AND   billing_group.event_date>= CURDATE() ";
    connection.query(sqlCountsSplit, function (err, sqlCountsSplitResult) {
      if (err) {
        console.log(err);
      }

      connection.query(sqlCountsDM, function (err, sqlCountsDMResult) {
        if (err) {
          console.log(err);
        }
        console.log(sqlCountsDM, "==========directemesage========");

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
    // AND billing_group_users.user_id!=" +
    // req.query.login_user_id +
    // "
    // sql1 = `SELECT
    //            users.name,users.group_admin_id,
    //            (  SELECT  CASE WHEN billing_group_users.status=1 THEN 1 ELSE 0 END FROM  billing_group_users WHERE billing_group_users.group_id= ${req.query.group_id} AND billing_group_users.user_id=${req.query.login_user_id} ) AS is_paid,
    //   billing_group.group_id,billing_group.spliting_amount,
    //   ( SELECT GROUP_CONCAT(users.profile_picture) FROM users LEFT JOIN billing_group_users ON billing_group_users.user_id=users.id WHERE billing_group_users.group_id=billing_group.group_id  AND users.id <> ${req.query.login_user_id} ) AS group_users_image,COUNT(*) AS contributors,
    //   (select  COUNT(*) from billing_group_users  WHERE billing_group_users.group_id=billing_group.group_id  AND  billing_group_users.status=1) AS paid_contributor,      (select  COUNT(*) from billing_group_users  WHERE billing_group_users.group_id=billing_group.group_id  AND  billing_group_users.status=0) AS pending_contributor,(select ROUND((sum( case when billing_group_users.payment_amount IS NOT NULL then billing_group_users.payment_amount else 0 end )/billing_group.spliting_amount) *100 ,2 ) from billing_group_users  WHERE billing_group_users.group_id=billing_group.group_id ) AS percentage,
    //   (select  CEIL(billing_group.spliting_amount/COUNT(*)) from billing_group_users WHERE billing_group_users.group_id=billing_group.group_id ) AS each_split ,billing_group.currency
    //   FROM billing_group
    //   LEFT JOIN billing_group_users ON billing_group_users.group_id=billing_group.group_id
    //   LEFT JOIN users ON users.id=billing_group_users.group_id
    //   WHERE billing_group_users.group_id=${req.query.group_id} GROUP BY users.id`;

    sql1 = ` SELECT
    users.name,
    users.group_admin_id,
    (
        SELECT
            CASE
                WHEN billing_group_users.status = 1 THEN 1
                ELSE 0
            END
        FROM
            billing_group_users
        WHERE
            billing_group_users.group_id = ${req.query.group_id}
            AND billing_group_users.user_id = ${req.query.login_user_id}
    ) AS is_paid,
    billing_group.group_id,
    billing_group.spliting_amount,
    (
        SELECT
            GROUP_CONCAT(users.profile_picture)
        FROM
            users
        LEFT JOIN
            billing_group_users ON billing_group_users.user_id = users.id
        WHERE
            billing_group_users.group_id = billing_group.group_id
            AND users.id <> ${req.query.login_user_id}
    ) AS group_users_image,
    COUNT(*) AS contributors,
    (
        SELECT
            COUNT(*)
        FROM
            billing_group_users
        WHERE
            billing_group_users.group_id = billing_group.group_id
            AND billing_group_users.status = 1
    ) AS paid_contributor,
    (
        SELECT
            COUNT(*)
        FROM
            billing_group_users
        WHERE
            billing_group_users.group_id = billing_group.group_id
            AND billing_group_users.status = 0
    ) AS pending_contributor,
    (
        SELECT
            ROUND(
                (SUM(
                        CASE
                            WHEN billing_group_users.payment_amount IS NOT NULL THEN billing_group_users.payment_amount
                            ELSE 0
                        END
                    ) / billing_group.spliting_amount
                ) * 100,
                2
            )
        FROM
            billing_group_users
        WHERE
            billing_group_users.group_id = billing_group.group_id
    ) AS percentage,
    (
        SELECT
            CEIL(billing_group.spliting_amount / COUNT(*))
        FROM
            billing_group_users
        WHERE
            billing_group_users.group_id = billing_group.group_id
    ) AS each_split,
    billing_group.currency
FROM
    billing_group
LEFT JOIN
    billing_group_users ON billing_group_users.group_id = billing_group.group_id
LEFT JOIN
    users ON users.id = billing_group_users.group_id
WHERE
    billing_group_users.group_id = ${req.query.group_id}
GROUP BY
    users.id`;

    console.log("ssq1========", sql1);
  }

  connection.query(sql1, async function (err, splitDetails) {
    console.log(err, splitDetails);

    if (splitDetails.length > 0) {
      let s1 = await dbScript(db_sql["Q1"], {
        var1: req.query.group_id,
        var2: "1",
      });
      let user1 = await queryAsync(s1);
      let s2 = await dbScript(db_sql["Q1"], {
        var1: req.query.group_id,
        var2: "0",
      });
      let user2 = await queryAsync(s2);

      splitDetails[0].notPaidUsers = user2;
      splitDetails[0].PaidUsers = user1;
      return res.json({
        response: splitDetails[0],
        success: true,
        message: "split group",
      });
    } else {
      return res.json({
        response: {},
        success: true,
        // message: "",
      });
    }
  });
};



exports.messagesSeen=async (req,res)=>{
  const { login_user_id,user_id,is_group}=req.query;
  var sql2 = `UPDATE chats SET is_seen = 1 WHERE is_seen=0 AND chats.sent_to = chats.send_by IN(${req.query.login_user_id},
    ${req.query.user_id} ) AND chats.sent_to IN(${req.query.login_user_id},
      ${req.query.user_id} )`;

}
exports.getChats3 = async (req, res) => {
  //  i have to write logic for
  // sql1= `UPDATE chats SET is_seen = 1 WHERE is_seen=0 AND chats.sent_to = ${}`;

  console.log("req.query===", req.query);
  var sql = "";
  var page = req.query.page ? req.query.page : 0;
  var condition = " ";

  if (
    req.query.search != "" &&
    req.query.search != undefined &&
    req.query.search != null
  ) {
    condition = '  AND (chats.message LIKE "%' + req.query.search + '%") ';
  }
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
      ") " +
      condition +
      " ORDER BY chats.id DESC Limit " +
      page * 30 +
      ",30";
  }
  if (req.query.is_group == 1 || req.query.is_group == 2) {
    var sql2 = `UPDATE chats SET is_seen = 1 WHERE is_seen=0 AND chats.sent_to = chats.send_by IN(${req.query.login_user_id},
      ${req.query.user_id} ) AND chats.sent_to IN(${req.query.login_user_id},
        ${req.query.user_id} )`;

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
          } else {
            chatItem.images = [];
          }
          parseImagesSync(chatList, index + 1, callback);
        } else {
          callback();
        }
      }

      function processChatList(chatList) {
        parseImagesSync(chatList, 0, () => {
          // Perform any further operations on the chatList
          // console.log(chatList);
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

// sqlcopy =
// `SELECT users.is_group,users.type AS group_type,CASE WHEN users.profile_picture IS NOT NULL THEN CONCAT('http://192.168.0.164:3000/images/profiles/',users.profile_picture)  ELSE '' END AS profile_picture,users.name,users.id, (SELECT  COUNT(users_requests.request_for) FROM users_requests WHERE users_requests.is_follow!=0  AND users_requests.request_for=users.id ) AS followed_by ,

// (SELECT TIMESTAMPDIFF(MINUTE, chats.created_datetime , CURRENT_TIMESTAMP)  FROM chats
// WHERE  (chats.sent_to=${req.query.login_user_id} AND chats.send_by=users.id
// )   ORDER BY chats.created_datetime DESC LIMIT 1) AS last_times_user_in ,

// (SELECT  chats.message  FROM chats WHERE (chats.sent_to=${req.query.login_user_id} AND chats.send_by=users.id
//   )    ORDER BY chats.created_datetime DESC LIMIT 1) AS message ,

// CASE WHEN users.is_group=1  THEN    (SELECT GROUP_CONCAT(users1.profile_picture) FROM users AS users1 LEFT JOIN groups_users ON groups_users.user_id=users1.id WHERE groups_users.group_id= users.id  )  END   AS group_users_image,

// CASE WHEN users.is_group=0  THEN (  CASE WHEN users.profile_picture IS NOT NULL THEN CONCAT(${
// constants.BASE_URL},'images/profiles/',users.profile_picture)  ELSE '' END ) ELSE '' END AS profile_picture,

// CASE WHEN users.is_group=0  THEN (SELECT COUNT(*) FROM chats WHERE chats.send_by=users.id AND chats.sent_to=${
// req.query.login_user_id } AND is_seen=0 ) ELSE 0 END AS newMessageCount

// FROM users
// LEFT JOIN users_requests
// ON (users.id =  case when users_requests.user_id<>${req.query.login_user_id} Then users_requests.user_id ELSE users_requests.request_for END)

// LEFT JOIN groups_users
// ON groups_users.group_id= users.id

// WHERE  ( (users_requests.user_id=${
// req.query.login_user_id } OR users_requests.request_for=${
// req.query.login_user_id}) AND
// ( users_requests.is_reject=0 AND users_requests.is_block=0 AND users_requests.is_accepted=1 )
// OR (users.is_group=1 AND groups_users.user_id=${req.query.login_user_id })  )
//  AND users.id <> ${req.query.login_user_id}
// ${search }
//   GROUP BY users.id  ORDER BY users.id DESC    limit  ${
// page * 10 },10`;

