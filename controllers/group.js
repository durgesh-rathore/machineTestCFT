var jwt = require("jsonwebtoken");
var connection = require("../config/db");
var constants = require("../config/constants");
require("./gift");
var { encryptPassword, checkPassword } = require("../config/custom");
const { db_sql, dbScript, queryAsync } = require("../helpers/db_scripts");
var { save } = require("../helpers/helper");
var multer = require("multer");
const path = require("path");
const fs = require("fs");

var a =
  "CASE WHEN users.profile_picture IS NOT NULL THEN CONCAT('" +
  constants.BASE_URL +
  "images/profiles/',users.profile_picture)  ELSE '' END AS profile_picture";

exports.add = function (req, res) {
  console.log("===========", req.body);
  try {
    var groupData = {
      group_admin_id: req.body.group_admin_id,
      type: req.body.type,
      name: req.body.name,
      is_group: 1,
    };
    connection.query(
      "SELECT * FROM users WHERE users.is_group=1 AND users.name='" +
        req.body.name +
        "' ",
      async function (err, presentgroup) {
        if (err) console.log(err);
        if (presentgroup.length > 0) {
          return res.json({
            success: true,
            message: "Group already exist.",
          });
        } else {
          connection.query(
            "INSERT INTO users SET ?",
            groupData,
            async function (err, group) {
              if (err) console.log(err);
              if (group) {
                console.log(req.body.group_members, "group_members ");
                var group_members = req.body.group_members.split(",");
                group_members.push(req.body.group_admin_id);
                group_members.forEach(async (element) => {
                  var group_users = {
                    group_id: group.insertId,
                    user_id: element,
                  };
                  await save("groups_users", group_users);
                  console.log("group_user======", group_users);
                  group_users = {};
                });

                return res.json({
                  success: true,
                  response: { group_id: group.insertId },
                  message: "Group created successful.",
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

exports.addMembersInGroup =async function (req, res) {
  var group_members = req.body.group_members.split(",");
  group_members.forEach( async (element) => {

    let s11 = await dbScript(db_sql["Q11"], {
      var1:req.body.group_id,
      var2: element,
    });
    let checkingExistingUser = await queryAsync(s11);
    if(checkingExistingUser.length==0){

    var group_users = {
      group_id: req.body.group_id,
      user_id: element,
    };

    let sql = "INSERT INTO groups_users SET ?";
    connection.query(sql, group_users, async (error) => {
      group_users = {};
      if (error) console.log(error);
      // console.log("ddd"); //item added!
    });
  }else{
    let sql =
    `UPDATE 
           groups_users 
        SET 
          is_not_exist=0,at_chat_id=0 
        WHERE 
          id=${checkingExistingUser[0].id} 
          AND  group_id =${req.body.group_id } 
          AND user_id=${element}`;
  connection.query(sql, async (error) => {
    if (error) {
      console.log(error);
    }})
  }
  });
  // let s12 = await dbScript(db_sql["Q12"], {
  //   var1: login_user_id,
  // });
  // let adminName = await queryAsync(s12);

  // let s13 = await dbScript(db_sql["Q13"], {
  //   var1: login_user_id,
  // });
  // let adminName = await queryAsync(s13);

  var data = {
          
    send_by: req.body.login_user_id,
    sent_to: req.body.group_id,
    is_group: 1,
    left_user_at:1,
    images:1,
    message:req.body.group_members
  };
  await save("chats", data);
  return res.json({
    success: true,
    message: "Added.",
  });
};

exports.getGroupList = function (req, res) {
  var page = req.query.page ? req.query.page : 0;

  var condition = " ";

  if (
    req.query.search != "" &&
    req.query.search != undefined &&
    req.query.search != null
  ) {
    condition +=
      '  AND ( users.type LIKE "%' +
      req.query.search +
      '%" OR users.name LIKE "%' +
      req.query.search +
      '%")  ';
  }

  var sql = " ";
  sql =
    "SELECT users.id,users.type,users.name,( SELECT GROUP_CONCAT(u1.profile_picture) FROM users AS u1 LEFT JOIN groups_users ON groups_users.user_id=u1.id WHERE groups_users.group_id=users.id AND groups_users.user_id<>" +
    req.query.login_user_id +
    "  ) AS group_users_image  FROM users  LEFT JOIN groups_users ON groups_users.group_id=users.id     WHERE users.is_group=1 AND groups_users.user_id=" +
    req.query.login_user_id +
    condition +
    " GROUP BY users.id  ORDER BY users.id DESC Limit " +
    page * 10 +
    ",10";
  console.log(sql);
  connection.query(sql, function (err, groupUsers) {
    console.log(err);
    var sqlCounts =
      "SELECT users.id FROM users  LEFT JOIN groups_users ON groups_users.group_id=users.id  WHERE users.is_group=1 AND  groups_users.user_id=" +
      req.query.login_user_id +
      condition +
      " GROUP BY users.id ";
    connection.query(sqlCounts, function (err, group_user_count) {
      if (err) {
        console.log(err);
      }
      if (groupUsers.length > 0) {
        return res.json({
          response: groupUsers,
          total_group: group_user_count.length,
          success: true,
          message: "post .",
        });
      } else {
        return res.json({
          response: groupUsers,
          total_group: group_user_count.length,
          success: true,
          message: "post .",
        });
      }
    });
  });
};

exports.addSplitGroup = function (req, res) {
  console.log("===========", req.body);
  try {
    var group = {
      name: req.body.name,
      group_admin_id: req.body.group_admin_id,
      is_group: 2,
    };
    connection.query(
      "INSERT INTO users SET ?",
      group,
      async function (err, users) {
        var group_members = req.body.group_members.split(",");
        group_members.push(req.body.group_admin_id);
        if (err) console.log(err);
        if (group) {
          var groupData = {
            spliting_amount: req.body.spliting_amount,
            event_date: req.body.event_date,
            due_date: req.body.due_date,
            group_id: users.insertId,
            currency: req.body.currency,
            each_split: req.body.spliting_amount / group_members.length,
          };
          if (req.body.payment_method) {
            groupData.payment_method = req.body.payment_method;
          }

          connection.query(
            "INSERT INTO billing_group SET ?",
            groupData,
            async function (err, group) {
              if (err) console.log(err);
              if (group) {
                console.log(req.body.group_members, "group_members ");
                // var group_members=[1,2,3,4];

                group_members.forEach((element) => {
                  var group_users = {
                    group_id: users.insertId,
                    user_id: element,
                  };
                  let sql = "INSERT INTO billing_group_users SET ?";
                  connection.query(sql, group_users, async (error) => {
                    if (error) console.log(error);
                    console.log("ddd"); //item added!
                  });
                  group_users = {};
                });

                // console.log("group_user======", group_users);
                return res.json({
                  success: true,
                  response: { group_id: users.insertId },
                  message: "Group created successful.",
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
exports.addMembersInSplitGroup = function (req, res) {
  var group_members = req.body.group_members.split(",");
  group_members.forEach((element) => {
    var group_users = {
      group_id: req.body.group_id,
      user_id: element,
    };
    let sql = "INSERT INTO billing_group_users SET ?";
    connection.query(sql, group_users, async (error) => {
      if (error) console.log(error);
      // console.log("ddd"); //item added!
    });
  });
  return res.json({
    success: true,
    message: "Added.",
  });
};
exports.getSplitGroupList = function (req, res) {
  var page = req.query.page ? req.query.page : 0;

  var condition = " ";

  if (
    req.query.search != "" &&
    req.query.search != undefined &&
    req.query.search != null
  ) {
    condition += '  AND ( users.name LIKE "%' + req.query.search + '%")  ';
  }

  var sql =
      ` SELECT 
            users2.id,users2.is_group,billing_group.event_date,
            billing_group.due_date,billing_group.spliting_amount,users2.name AS groups_Name,
            ( SELECT GROUP_CONCAT(u1.profile_picture) 
              FROM users  AS u1 
              LEFT JOIN  billing_group_users 
                  ON billing_group_users.user_id=u1.id WHERE u1.id<>${req.query.login_user_id } AND  billing_group_users.group_id=users2.id ) AS group_users_image, 
            (select (sum( case when billing_group_users.payment_amount IS NOT NULL then billing_group_users.payment_amount else 0 end )/billing_group.spliting_amount) *100  from billing_group_users  WHERE billing_group_users.group_id=users2.id ) AS percentage , 
            MONTH(billing_group.event_date) AS event_month,  
            YEARWEEK(billing_group.event_date) AS event_week,
            YEARWEEK(CURRENT_DATE()) AS current_week ,  
            CASE            
                WHEN  YEARWEEK(billing_group.event_date) = YEARWEEK(CURDATE()) 
                   THEN 'This week'         
                   ELSE 'This Month'     
                END AS WMTag , 
                billing_group_users.is_muted AS is_muted
             FROM 
          users AS users2 
          LEFT JOIN billing_group ON billing_group.group_id=users2.id 
          LEFT JOIN billing_group_users ON billing_group_users.group_id=billing_group.group_id  
          LEFT JOIN users AS user1 ON user1.id=billing_group_users.user_id  
       WHERE
            users2.is_group=2 
            AND billing_group_users.user_id=${req.query.login_user_id}   ${condition} 
            AND YEAR(billing_group.event_date) = YEAR(CURDATE()) 
            AND MONTH(billing_group.event_date) = MONTH(CURDATE())   
            AND   billing_group.event_date>= CURDATE() 
       ORDER BY
           users2.id DESC  
       Limit  
          ${page * 10} ,10`;
  console.log(sql);
  connection.query(sql, function (err, groupUsers) {
    var sqlCountsDM =
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
      "'  GROUP BY users.id  ";

    console.log("sqlCountsDM============>>", sqlCountsDM);

    var sqlCountsSplit =
      "SELECT COUNT(*) AS counts FROM users AS users2 LEFT JOIN billing_group ON billing_group.group_id=users2.id  LEFT JOIN billing_group_users ON billing_group_users.group_id=billing_group.group_id  LEFT JOIN users AS user1 ON user1.id=billing_group_users.user_id  WHERE users2.is_group=2 AND billing_group_users.user_id=" +
      req.query.login_user_id +
      condition +
      " AND YEAR(billing_group.event_date) = YEAR(CURDATE()) AND MONTH(billing_group.event_date) = MONTH(CURDATE())   AND   billing_group.event_date>= CURDATE()";

    connection.query(
      sqlCountsSplit,
      async function (err, sqlCountsSplitResult) {
        if (err) {
          console.log(err);
        }

        connection.query(sqlCountsDM, async function (err, sqlCountsDMResult) {
          if (err) {
            console.log(err);
          }
          console.log(sqlCountsDMResult, "==========sqlCountsDMResult");
          if (sqlCountsDMResult.length) {
          }

          if (groupUsers.length > 0) {
            // for(let i=0;i<groupUsers.length-1;i++){

            var week = [];
            var month = [];

            await groupUsers.forEach((element) => {
              if (element.WMTag == "This week") {
                week.push(element);
              } else {
                month.push(element);
              }
            });

            return res.json({
              // response: groupUsers,
              response: { weekEvents: week, monthEvents: month },
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
      }
    );
  });
};

exports.leftGroup =  async function (req, res) {
  // login_user_id  this tag id off which user which is get remove or left group

  const { group_id,login_user_id,is_left_by_admin,name} =req.body;
  if (
    group_id == undefined ||
    group_id == "" ||
    group_id == null ||
    login_user_id == undefined ||
    login_user_id == "" ||
    login_user_id == null   
    
  ) {
    return res.json({
      success: false,
      message: "Something went wrong.",
    });
  } else {


    let s10 = await dbScript(db_sql["Q10"], {
      var1: group_id,  
    });
    var at_chat_id=0;
    let lastChatWhenLeftUser = await queryAsync(s10);
    if(lastChatWhenLeftUser.length>0){
    console.log(lastChatWhenLeftUser[0].id, " ======ffffffffffffffffff==");
    at_chat_id=lastChatWhenLeftUser[0].id
    }

    let sql =
      `UPDATE  groups_users SET is_not_exist=1,at_chat_id=${at_chat_id} WHERE group_id =${
      group_id }  AND user_id=
      ${login_user_id}`;
    connection.query(sql, async (error) => {
      if (error) {
        console.log(error);
      } else {

        var data = {
          
          send_by: login_user_id,
          sent_to: group_id,
          is_group: 1,
          left_user_at:1
        };

        let s3 = await dbScript(db_sql["Q3"], {
          var1: login_user_id,
        });
        let forUserName = await queryAsync(s3);

        if(is_left_by_admin==1){
         
         data.message=` Admin removed ${forUserName[0].name} .`
        
         
        }else{

          data.message=`${forUserName[0].name} left the group.`
          
        }
        await save("chats", data);
       

      
        return res.json({
          success: true,
          message: "Left.",
        });
      }
    });
  }
};

exports.deleteGroup = function (req, res) {
  if (
    req.body.group_id == undefined ||
    req.body.group_id == "" ||
    req.body.group_id == null ||
    req.body.login_user_id == undefined ||
    req.body.login_user_id == "" ||
    req.body.login_user_id == null
  ) {
    return res.json({
      success: true,
      message: "please select group_id.",
    });
  } else {
    var sql1 =
      "SELECT * FROM users WHERE users.group_admin_id=" +
      req.body.login_user_id +
      "  AND users.id=" +
      req.body.group_id +
      " ";
    connection.query(sql1, async function (error, result1) {
      if (error) {
        return res.json({
          success: false,
          message: "Something went wrong.",
        });
      } else if (result1.length > 0) {
        let sql =
          "DELETE FROM groups_users WHERE group_id =" + req.body.group_id;
        connection.query(sql, async function (error, result) {
          if (error) {
            console.log(error);
          } else {
            return res.json({
              success: true,
              message: "Group deleted.",
            });
          }
        });
      } else {
        return res.json({
          success: true,
          message: "Only admin can delete group.",
        });
      }
    });
  }
};

exports.informationOfGroup = function (req, res) {
  var group_details_sql =
    "SELECT users.id,users.type AS group_type ,users.group_admin_id,users.name AS group_name,( SELECT GROUP_CONCAT(u1.profile_picture) FROM users AS u1 LEFT JOIN groups_users ON groups_users.user_id=u1.id WHERE groups_users.group_id=users.id AND groups_users.user_id!=" +
    req.query.login_user_id +
    "  ) AS group_users_image  FROM users    WHERE users.is_group=1 AND users.id=" +
    req.query.group_id;

  console.log("group details sql==================", group_details_sql);

  connection.query(group_details_sql, function (err, group_details) {
    if (err) {
      console.log("somthing went wrong");
      return res.json({
        success: false,
        message: "Something went wrong",
      });
    }
    var sqlCounts =
      "SELECT groups_users.id  FROM groups_users  LEFT JOIN users ON users.id=groups_users.user_id WHERE groups_users.group_id=" +
      req.query.group_id;
    connection.query(sqlCounts, function (err, group_user_count) {
      if (err) {
        console.log(err);
      }
      return res.json({
        response: group_details,
        total_member_in_group: group_user_count.length,
        success: true,
        message: "Group info .",
      });
    });
  });
};

exports.getGroupUsers = function (req, res) {
  let {search,group_id,login_user_id,page}=req.query;
  var page1 = page ? page : 0;

  var condition = " ";

  if (
    search != "" &&
    search != undefined &&
    search != null
  ) {
    condition +=
      '  AND ( users.type LIKE "%' +
      search +
      '%" OR users.name LIKE "%' +
      search +
      '%")  ';
  }

  var sql = " ";

  sql =
    `SELECT users.*, ${
    a }  FROM groups_users  LEFT JOIN users ON users.id=groups_users.user_id WHERE groups_users.is_not_exist<>1 AND groups_users.group_id=${
    group_id}

    ORDER BY
  CASE
     WHEN users.id=${login_user_id} THEN 0 
      ELSE 1
      END,
  users.id DESC`;
  console.log(sql);
  connection.query(sql, function (err, groupUsers) {
    console.log(err);
    var sqlCounts =
      "SELECT groups_users.id  FROM groups_users  LEFT JOIN users ON users.id=groups_users.user_id WHERE groups_users.group_id=" +
      group_id;
    connection.query(sqlCounts, function (err, group_user_count) {
      if (err) {
        console.log(err);
      }
      if (groupUsers.length > 0) {
        return res.json({
          response: groupUsers,
          total_member_in_group: group_user_count.length,
          success: true,
          message: "Group info .",
        });
      } else {
        return res.json({
          response: [],
          total_group: group_user_count.length,
          success: true,
          message: "Group info .",
        });
      }
    });
  });
};

exports.getPaymentMethod = function (req, res) {
  var sql =
    "SELECT billing_group.payment_method  FROM billing_group    WHERE billing_group.group_id=" +
    req.query.group_id;

  connection.query(sql, function (err, paymentMethod) {
    if (err) {
      console.log("somthing went wrong", err);
      return res.json({
        success: false,
        message: "Something went wrong",
      });
    } else {
      if (paymentMethod.length == 0) {
        return res.json({
          success: false,
          message: "Payment method not found.",
        });
      } else {
        return res.json({
          success: true,
          message: "Payment Method",
          res: paymentMethod,
        });
      }
    }
  });
};

exports.contributorsList = function (req, res) {
  const { group_id } = req.query;
  console.log(req.query, " in the fight ");

  var sql = `SELECT users.name, ${a} ,bgu.* FROM billing_group_users AS bgu LEFT JOIN users ON users.id=bgu.user_id WHERE bgu.group_id=${group_id}`;

  connection.query(sql, function (err, paymentMethod) {
    if (err) {
      console.log("somthing went wrong", err);
      return res.json({
        success: false,
        message: "Something went wrong",
      });
    } else {
      if (paymentMethod.length == 0) {
        return res.json({
          success: false,
          message: "Payment method not found.",
        });
      } else {
        var sql1 = `SELECT CASE WHEN bgu.payment_amount IS NULL THEN 0 ELSE SUM(bgu.payment_amount) END AS total_contributed_payment FROM billing_group_users AS bgu  WHERE  bgu.status=1 AND bgu.group_id=${group_id}`;
        console.log(sql1);
        connection.query(sql1, function (err, totalContributedAmount) {
          if (err) {
            console.log("somthing went wrong", err);
            return res.json({
              success: false,
              message: "Something went wrong",
            });
          } else {
            console.log(
              " dddd ===",
              totalContributedAmount,
              totalContributedAmount[0].total_contributed_payment
            );

            return res.json({
              success: true,
              message: "Payment Method",
              res: paymentMethod,
              total_contributed_payment:
                totalContributedAmount[0].total_contributed_payment,
            });
          }
        });
      }
    }
  });
};

exports.paymentStatus = function (req, res) {
  const { group_id, user_id } = req.body;
  let status = 1;
  console.log(" in ffdd");

  var sql1 = `SELECT each_split FROM billing_group WHERE group_id=${group_id}`;

  connection.query(sql1, function (err, splitAmount) {
    if (err) {
      console.log("somthing went wrong", err);
      return res.json({
        success: false,
        message: "Something went wrong",
      });
    } else {
      var sql = `UPDATE billing_group_users AS bgu SET  bgu.status=${status},payment_amount=${splitAmount[0].each_split}  WHERE bgu.group_id=${group_id} AND bgu.user_id=${user_id}`;

      connection.query(sql, function (err, paymentMethod) {
        if (err) {
          console.log("somthing went wrong", err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        } else {
          if (paymentMethod.length == 0) {
            return res.json({
              success: false,
              message: "Payment method not found.",
            });
          } else {
            return res.json({
              success: true,
              message: "Payment status updated successfully",
            });
          }
        }
      });
    }
  });
};

exports.informationOfSplitGroup = function (req, res) {
  var page = req.query.page ? req.query.page : 0;

  var condition = " ";

  if (
    req.query.search != "" &&
    req.query.search != undefined &&
    req.query.search != null
  ) {
    condition +=
      '  AND ( users.type LIKE "%' +
      req.query.search +
      '%" OR users.name LIKE "%' +
      req.query.search +
      '%")  ';
  }

  var sql = " ";
  var group_details_sql =
    "SELECT billing_group.*,users.id,users.type AS group_type ,users.name AS group_name,( SELECT GROUP_CONCAT(u1.profile_picture) FROM users AS u1 LEFT JOIN billing_group_users ON billing_group_users.user_id=u1.id WHERE billing_group_users.group_id=users.id AND billing_group_users.user_id!=" +
    req.query.login_user_id +
    "  ) AS group_users_image  FROM users  LEFT JOIN billing_group ON billing_group.group_id=users.id   WHERE users.is_group=2 AND users.id=" +
    req.query.group_id;

  console.log("group details sql==================", group_details_sql);

  connection.query(group_details_sql, function (err, group_details) {
    if (err) {
      console.log("somthing went wrong");
      return res.json({
        success: false,
        message: "Something went wrong",
      });
    }

    sql =
      "SELECT users.*, " +
      a +
      "  FROM billing_group_users  LEFT JOIN users ON users.id=billing_group_users.user_id     WHERE billing_group_users.group_id=" +
      req.query.group_id;
    console.log(sql);
    connection.query(sql, function (err, groupUsers) {
      console.log(err);
      var sqlCounts =
        "SELECT billing_group_users.id  FROM billing_group_users  WHERE billing_group_users.group_id=" +
        req.query.group_id;
      connection.query(sqlCounts, function (err, group_user_count) {
        if (err) {
          console.log(err);
        }
        if (groupUsers.length > 0) {
          return res.json({
            response: { group: group_details, users: groupUsers },
            total_member_in_group: group_user_count.length,
            success: true,
            message: "Group info .",
          });
        } else {
          return res.json({
            response: [],
            total_group: group_user_count.length,
            success: true,
            message: "Group info .",
          });
        }
      });
    });
  });
};

exports.isMuted = function (req, res) {
  const { group_id, user_id, is_muted, chat_user_id,group_type } = req.body;
  let status = 1;
  var message = "";
  if (is_muted == 0) {
    message = "Unmuted.";
  } else {
    message = "Muted.";
  }

  console.log(" in ffdd", req.body);
  var sql = " ";
  if (group_id != "" && group_id && group_id != "undefined") {
    if(group_type==2){
      sql = `UPDATE billing_group_users AS gu SET  gu.is_muted=${is_muted}  WHERE gu.group_id=${group_id} AND gu.user_id=${user_id}`;
          }else{
      sql= `UPDATE groups_users AS gu SET  gu.is_muted=${is_muted}  WHERE gu.group_id=${group_id} AND gu.user_id=${user_id}`;
    }
    connection.query(sql, function (err, muteData) {
      if (err) {
        console.log("somthing went wrong", err);
        return res.json({
          success: false,
          message: "Something went wrong",
        });
      } else {
        if (muteData.length == 0) {
          return res.json({
            success: false,
            message: "Already done.",
          });
        } else {
          return res.json({
            success: true,
            message: message,
          });
        }
      }
    });
  } else {
    connection.query(
      `SELECT * FROM mute_users_for_sigle_chat WHERE chat_user_id=${chat_user_id} AND user_id=${user_id} `,
      async function (err, muteDataForSigleChat) {
        if (muteDataForSigleChat.length > 0) {
          sql = `UPDATE mute_users_for_sigle_chat AS mufsc SET  mufsc.is_muted=${is_muted}  WHERE mufsc.chat_user_id=${chat_user_id} AND mufsc.user_id=${user_id}`;

          connection.query(sql, function (err, muteData) {
            if (err) {
              console.log("somthing went wrong", err);
              return res.json({
                success: false,
                message: "Something went wrong",
              });
            } else {
              if (muteData.length == 0) {
                return res.json({
                  success: false,
                  message: "Already done.",
                });
              } else {
                return res.json({
                  success: true,
                  message: message,
                });
              }
            }
          });
        } else {
          var a = await save("mute_users_for_sigle_chat", {
            user_id: user_id,
            chat_user_id: chat_user_id,
          });
          if (a) {
            return res.json({
              success: true,
              message: message,
            });
          } else {
            return res.json({
              success: false,
              message: "Something went wrong.",
            });
          }
        }
      }
    );
  }
};
