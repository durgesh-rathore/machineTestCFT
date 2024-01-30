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

  var sql = "";
  var page = req.query.page ? req.query.page : 0;
  var condition = " ";
  var dd = " ";
  var searchCondition =
    req.query.search != "" &&
    req.query.search != undefined &&
    req.query.search != null;
  var condition2 = "";

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
    if (searchCondition) {
      let s6 = await dbScript(db_sql["Q6"], {
        var1: login_user_id,
        var2: user_id,
        var3: condition,
      });

      // group user seen chat yet here
      let chatSearch = await queryAsync(s6);

      if (chatSearch.length > 0) {
        // condition2 = "  AND chats.id <=" + chatSearch[0].id;
      } else {
        return res.json({
          response: [],
          success: false,
          message: "No match record found.",
        });
      }
    }
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


console.log("ddddd",sql);
    connection.query(sql, async function (err, chatList) {
      if (chatList.length > 0) {
        let s8 = await dbScript(db_sql["Q8"], {
          var2: user_id,
          var1: login_user_id,
        });
        // seen chat yet here
        let lastChatSeen = await queryAsync(s8);
        from_chat_id = 0;
        if (lastChatSeen.length > 0) {
          from_chat_id = lastChatSeen[0].from_chat_id;
        }
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
          });
        }

        processChatList(chatList);
        console.log("chat data==",chatList);
        return res.json({
          response: chatList,
          from_chat_id: from_chat_id,
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

    if (searchCondition) {
      let s7 = await dbScript(db_sql["Q7"], {
        var1: user_id,
        var2: condition,
      });
      // group user seen chat yet here
      let chatSearch = await queryAsync(s7);

      if (chatSearch.length > 0) {
        //  condition2 = "  AND chats.id <= " + chatSearch[0].id;
      } else {
        return res.json({
          response: [],
          success: false,
          message: "No match record found.",
        });
      }
    }

    let s9 = await dbScript(db_sql["Q9"], {
      var1: user_id,
      var2: login_user_id,
    });

    let forExitUser = await queryAsync(s9);

    if (forExitUser.length > 0) {
      condition2 = "  AND chats.id <= " + forExitUser[0].at_chat_id;
    } else {
      condition2 = " ";
    }

    sql = `SELECT 
              chats.*,

              CASE
        WHEN chats.left_user_at = 1 THEN
            CASE
            WHEN chats.images = 1 AND chats.send_by = ${login_user_id} THEN
            CONCAT(
                'You added ',
                (
                    SELECT   name                      
                        
                    FROM users
                    WHERE id=chats.message
                )
            )
                WHEN chats.images = 1 THEN
                    CONCAT('Admin added ',
                    CASE WHEN chats.message<>${login_user_id} THEN
                    (    SELECT     name                      
                          FROM users
                         WHERE id= chats.message
                      ) ELSE                        
                       " you"  END
                        
                    )


                ELSE
                    CASE
                        WHEN chats.send_by = ${login_user_id} AND chats.message = chats.send_by THEN
                            "You left."
                        ELSE
                            CASE
                                WHEN chats.send_by = ${login_user_id} THEN
                                CONCAT('You removed ',(SELECT name FROM users WHERE id = chats.message))
                                ELSE
                                    CASE
                                        WHEN chats.message = chats.send_by THEN
                                            CONCAT((SELECT name FROM users WHERE id = chats.message), ' left.')
                                        ELSE 
                                          CASE
                                             WHEN chats.message = ${login_user_id} THEN
                                              'Admin removed you'
                                               ELSE
                                                CONCAT('Admin removed ',(SELECT name FROM users WHERE id = chats.message) )
                                            END
                                    END
                            END
                    END
            END
        ELSE
            chats.message
    END AS message,
    


              ${dd}  CONCAT('${
      constants.BASE_URL
    }','images/profiles/',users.profile_picture) AS profile_picture,
               users.name,
               case when chats.images IS NOT NULL then chats.images   else ''  end AS images 
          FROM 
              chats 
          LEFT JOIN 
             users ON users.id=chats.send_by
          WHERE 
            chats.sent_to=${req.query.user_id}    ${condition2} 
          ORDER BY 
            chats.id DESC  
          Limit ${page * 30},30`;

    connection.query(sql, async function (err, chatList) {
      if (chatList.length > 0) {
        let s8 = await dbScript(db_sql["Q8"], {
          var2: user_id,
          var1: login_user_id,
        });
        // seen chat yet here
        from_chat_id = 0;
        // if(lastChatSeen.length>0){
        //   from_chat_id= lastChatSeen[0].from_chat_id

        // }

        function parseImagesSync(chatList, index, callback) {
          if (index < chatList.length) {
            const chatItem = chatList[index];
            if (
              chatItem.images != null &&
              chatItem.images !== "" &&
              chatItem.images != 1 &&
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
          });
        }

        processChatList(chatList);
        return res.json({
          response: chatList,
          from_chat_id: from_chat_id,
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
    users.group_admin_id,
    (
        SELECT COUNT(users_requests.request_for)
        FROM users_requests
        WHERE users_requests.is_follow != 0
            AND users_requests.request_for = users.id
    ) AS followed_by,

    ( CASE WHEN users.is_group=1 AND groups_users.is_not_exist=1 THEN
    (
        SELECT TIMESTAMPDIFF(
            MINUTE,
            chats.created_datetime,
            CURRENT_TIMESTAMP
        )
        FROM chats
        WHERE   chats.id=groups_users.at_chat_id
        ORDER BY chats.created_datetime DESC
        LIMIT 1
    ) 
    WHEN users.is_group=1  THEN
    (
        SELECT TIMESTAMPDIFF(
            MINUTE,
            chats.created_datetime,
            CURRENT_TIMESTAMP
        )
        FROM chats
        WHERE   chats.sent_to =users.id      ORDER BY chats.created_datetime DESC
        LIMIT 1
    )


    ELSE 
    (  SELECT TIMESTAMPDIFF(
      MINUTE,
      chats.created_datetime,
      CURRENT_TIMESTAMP
  )
  FROM chats
  WHERE (
      ( chats.sent_to = ${req.query.login_user_id}
      AND chats.send_by = users.id ) OR ( chats.sent_to =users.id
      AND chats.send_by =  ${req.query.login_user_id} )
  )
  ORDER BY chats.created_datetime DESC
  LIMIT 1 ) END ) AS last_times_user_in,
    


    ( CASE WHEN users.is_group=1 AND groups_users.is_not_exist=1 THEN
      (
           SELECT chats.message
           FROM chats
           WHERE chats.id=groups_users.at_chat_id        
           ORDER BY chats.created_datetime DESC
           LIMIT 1
       )  ELSE
       (
           SELECT chats.message
           FROM chats
           WHERE (
             ( chats.sent_to =  ${req.query.login_user_id}
             AND chats.send_by = users.id ) OR ( chats.sent_to =users.id
             AND chats.send_by =   ${req.query.login_user_id}  )
         )  
           
           ORDER BY chats.created_datetime DESC
           LIMIT 1
       ) END ) AS message,

       csig.from_chat_id,

    CASE
        WHEN users.is_group = 1
        THEN (
            SELECT GROUP_CONCAT(users1.profile_picture)
            FROM users AS users1
            LEFT JOIN groups_users ON groups_users.user_id = users1.id
            WHERE groups_users.group_id = users.id AND groups_users.is_not_exist<>1
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
    
(   SELECT COUNT(*)
             FROM chats
             WHERE 
             CASE
                WHEN users.is_group = 0 
                     THEN (
                       chats.send_by = users.id
                       AND chats.sent_to = ${req.query.login_user_id} )
                     ELSE chats.sent_to=users.id END 
                AND chats.id>
        
        (CASE WHEN 
                 ( SELECT from_chat_id FROM chat_seen_in_group_by_user WHERE chat_seen_in_group_by_user.user_id=${
                   req.query.login_user_id
                 } AND chat_seen_in_group_by_user.seen_chat_user_id=users.id 
                  ORDER BY chat_seen_in_group_by_user.id DESC 
                  LIMIT 1
        ) IS NULL THEN 0 
         
         ELSE (SELECT from_chat_id FROM chat_seen_in_group_by_user WHERE chat_seen_in_group_by_user.user_id=${
           req.query.login_user_id
         } AND chat_seen_in_group_by_user.seen_chat_user_id=users.id 
         ORDER BY  chat_seen_in_group_by_user.id DESC
         LIMIT 1 )    END  ) )


    AS newMessageCount,


    CASE
    WHEN users.is_group = 1 AND is_not_exist=1
    THEN 1  ELSE 0 
  END  AS is_not_exist,
   

    CASE
      WHEN users.is_group = 1
      THEN groups_users.is_muted
        ELSE 
          CASE 
             WHEN users.is_group = 0  
             THEN 
               ( SELECT mufsc.is_muted FROM mute_users_for_sigle_chat AS mufsc WHERE mufsc.chat_user_id=users.id AND mufsc.user_id=${
                 req.query.login_user_id
               } )
             ELSE 0 END 
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
LEFT JOIN chat_seen_in_group_by_user AS csig ON csig.seen_chat_user_id = users.id AND csig.user_id= ${req.query.login_user_id}



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
ORDER BY last_times_user_in IS NULL, last_times_user_in ASC
LIMIT ${page * 10}, 20`;

console.log(sql," ====================directmessage")

  connection.query(sql, function (err, directMessages) {
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
      }

      connection.query(sqlCountsDM, function (err, sqlCountsDMResult) {
        if (err) {
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

  // CASE
  // WHEN users.is_group = 1
  // THEN (
  //    SELECT GROUP_CONCAT(user_id)
  //    FROM groups_users
  //    WHERE  groups_users.is_muted=1
  //           AND  groups_users.group_id=users.id )
  // ELSE
  //   CASE
  //       WHEN users.is_group = 0
  //       THEN
  //           ( SELECT
  //                GROUP_CONCAT(mufsc.user_id)
  //             FROM mute_users_for_sigle_chat AS mufsc
  //             WHERE mufsc.is_muted=1 AND
  //                (
  //                   (mufsc.chat_user_id=users.id AND  mufsc.user_id=${
  //                     req.query.login_user_id
  //                   } )
  //                OR
  //                   ( mufsc.user_id=users.id  AND mufsc.chat_user_id=${
  //                     req.query.login_user_id
  //                   }  )
  //                 )
  //           )
  //      ELSE 0
  //   END
  // END  AS mute_users,
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

    if (c) {
      return res.json({ success: true, message: "sent." });
    } else {
      return res.json({ success: false, message: "something went wrong" });
    }
  }
};
exports.sendFiles = async (req, res) => {
  console.log(req.body," ddd ddd");

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

    var c = await save("chats", data);

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
  }

  connection.query(sql1, async function (err, splitDetails) {
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
      });
    }
  });
};

exports.messagesSeen1 = async (req, res) => {
  const { login_user_id, seen_chat_user_id, from_chat_id } = req.body;

  if (
    login_user_id &&
    login_user_id != "undefined" &&
    seen_chat_user_id &&
    seen_chat_user_id != "undefined" &&
    from_chat_id &&
    from_chat_id != "undefined"
  ) {
    var obj = {
      from_chat_id: from_chat_id,
      user_id: login_user_id,
      seen_chat_user_id: seen_chat_user_id,
    };

    a = await save("chat_seen_in_group_by_user", obj);
    if (a) {
      return res.json({
        success: true,
        message: "Messages are seen.",
      });
    } else {
      return res.json({
        success: false,
        message: "Message aren't seen.",
      });
    }
  } else {
    return res.json({
      success: false,
      message: "Something went wrong.",
    });
  }
};
exports.getChats3 = async (req, res) => {
  //  i have to write logic for
  // sql1= `UPDATE chats SET is_seen = 1 WHERE is_seen=0 AND chats.sent_to = ${}`;

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
        parseImagesSync(chatList, 0, () => {});
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

exports.getChats2 = async (req, res) => {
  //  i have to write logic for
  const { page1, search, login_user_id, user_id, is_group } = req.query;
  // sql1= `UPDATE chats SET is_seen = 1 WHERE is_seen=0 AND chats.sent_to = ${}`;

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

  connection.query(sql, async function (err, chatList) {
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


exports.notificationCount = async (req, res) => {
  const { login_user_id } = req.query;

  if (
    login_user_id &&
    login_user_id != "undefined" 
      ) {

var sql=`SELECT COUNT(*) AS cou FROM notification WHERE user_id=${login_user_id} AND is_seen=0`;
console.log(sql," dddddd");
   connection.query(sql,(err,counts)=>{
    if(err){
console.log(err);
    }else
    if (counts) {
      return res.json({
        success: true,
        notificationCount:counts[0].cou,
        message: " Unseen notification count.",
      });
    } else {
      return res.json({
        success: false,
        message: "Message aren't seen.",
      });
    }
  })
  } else {
    return res.json({
      success: false,
      message: "Something went wrong.",
    });
  }
  
};

exports.chatNotificationCount = async (req, res) => {
  const { login_user_id} = req.query;

  if (
    login_user_id &&
    login_user_id != "undefined" 
      ) {

        let s20 = await dbScript(db_sql["Q20"], {
               var1: login_user_id
        });
        
        let counts = await queryAsync(s20);

console.log(counts,"  get message not seen counts ========");
    if (counts.length>0) {
      return res.json({
        success: true,
        notificationCount:counts[0].cou,
        message: "Chat unseen notification count.",
      });
    } else{
      return res.json({
        success: true,
        notificationCount:counts[0].cou,
        message: "Chat unseen notification count.",
      });
    }
  
  } else {
    return res.json({
      success: false,
      message: "Something went wrong.",
    });
  }
  
};

exports.getNotificationList = async (req, res) => {
  const { login_user_id} = req.query;

  if (
    login_user_id &&
    login_user_id != "undefined" 
      ) {

var sql=`SELECT * FROM notification WHERE user_id=${login_user_id} AND is_seen=0`;
console.log(sql," dddddd");
   connection.query(sql,(err,notificationList)=>{
    if(err){
console.log(err);
    }else
    if (notificationList.length>=0) {
      connection.query(`UPDATE notification SET is_seen=1 WHERE user_id=${login_user_id} AND is_seen=0`,(err,result)=>{});
      return res.json({
        success: true,
        notificationList:notificationList,
        message: "Notification list.",
      });
    } else {
      return res.json({
        success: false,
        message: "Notification list..",
      });
    }
  })
  } else {
    return res.json({
      success: false,
      message: "Something went wrong.",
    });
  }
  
};

exports.NotificationSeen = async (req, res) => {
  const { login_user_id,notification_id} = req.body;

  if (
    login_user_id &&
    login_user_id != "undefined" && notification_id && notification_id != "undefined"
      ) {

 var sql=`UPDATE notification SET is_seen=1 WHERE user_id=${login_user_id} AND is_seen=0 AND id=${notification_id}`;
console.log(sql," dddddd");
   connection.query(sql,(err,notificationList)=>{
    if(err){
console.log(err);
return res.json({
  success: false,
  message: "Something went wrong",
});
    }else
    if (notificationList) {
      return res.json({
        success: true,
        notificationList:notificationList,
        message: "Notification seen.",
      });
    } else {
      return res.json({
        success: false,
        message: "some went wrong",
      });
    }
  })
  } else {
    return res.json({
      success: false,
      message: "Something went wrong.",
    });
  }
  
};

exports.messagesSeen = async (req, res) => {
  const { login_user_id,seen_chat_user_id,from_chat_id} = req.body;

  if (
    login_user_id &&
    login_user_id != "undefined"  && 
    seen_chat_user_id &&
    seen_chat_user_id != "undefined" && 
    from_chat_id && 
    from_chat_id != "undefined" 
   
      ) {


        let s21 = await dbScript(db_sql["Q21"], {
          var1: from_chat_id,
          var2: login_user_id,
          var3: seen_chat_user_id
   });
   
   let messagesSeen = await queryAsync(s21);

    if (messagesSeen) {
      return res.json({
        success: true,
        message: "Messages seen.",
      });
    } else {
      return res.json({
        success: false,
        message: "some went wrong",
      });
    }
  
  } else {
    return res.json({
      success: false,
      message: "Something went wrong.",
    });
  }
  
};