var jwt = require("jsonwebtoken");
var connection = require("../config/db");
var constants = require("../config/constants");
require("./gifingcall");
var { encryptPassword, checkPassword } = require("../config/custom");
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

exports.addMembersInGroup = function (req, res) {
  var group_members = req.body.group_members.split(",");
  group_members.forEach((element) => {
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
  });
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
    "SELECT users.id,users.type,users.name,( SELECT GROUP_CONCAT(u1.profile_picture) FROM users AS u1 LEFT JOIN groups_users ON groups_users.user_id=u1.id WHERE groups_users.group_id=users.id AND groups_users.user_id!=" +
    req.query.login_user_id +
    "  ) AS group_users_image  FROM users  LEFT JOIN groups_users ON groups_users.group_id=users.id     WHERE users.is_group=1 AND groups_users.user_id=" +
    req.query.login_user_id +
    condition +
    " GROUP BY users.id Limit " +
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
      "SELECT * FROM users WHERE users.is_group=2 AND users.name='" +
        req.body.name +
        "' ",
      async function (err, presentgroup) {
        if (err) console.log(err);
        if (presentgroup.length > 0) {
          return res.json({
            success: true,
            response: { group_id: group.insertId },
            message: "Group already exist.",
          });
        } else {
          connection.query(
            "INSERT INTO users SET ?",
            group,
            async function (err, users) {
              if (err) console.log(err);
              if (group) {
                var groupData = {
                  spliting_amount: req.body.spliting_amount,
                  event_date: req.body.event_date,
                  due_date: req.body.due_date,
                  group_id: users.insertId,
                  currency:req.body.currency,
                };

                connection.query(
                  "INSERT INTO billing_group SET ?",
                  groupData,
                  async function (err, group) {
                    if (err) console.log(err);
                    if (group) {
                      console.log(req.body.group_members, "group_members ");
                      // var group_members=[1,2,3,4];
                      var group_members = req.body.group_members.split(",");

                      // var group_users = {};
                      // group.group_id = users.insertId;
                      group_members.push(req.body.group_admin_id);
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
                        group_users={};
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
    "SELECT users2.id,users2.is_group,billing_group.event_date,billing_group.due_date,billing_group.spliting_amount,users2.name AS groups_Name,( SELECT GROUP_CONCAT(users.profile_picture) FROM users  LEFT JOIN  billing_group_users ON billing_group_users.user_id=users2.id WHERE users.id!=" +
    req.query.login_user_id +
    "  ) AS group_users_image,  (select (sum( case when billing_group_users.payment_amount IS NOT NULL then billing_group_users.payment_amount else 0 end )/billing_group.spliting_amount) *100  from billing_group_users  WHERE billing_group_users.group_id=users2.id ) AS percentage , MONTH(billing_group.event_date) AS event_month,    YEARWEEK(billing_group.event_date) AS event_week,     YEARWEEK(CURRENT_DATE()) AS current_week ,    CASE             WHEN YEARWEEK(billing_group.event_date) = YEARWEEK(CURDATE()) THEN 'This week'             ELSE 'This Month'         END AS WMTag     FROM users AS users2 LEFT JOIN billing_group ON billing_group.group_id=users2.id  LEFT JOIN billing_group_users ON billing_group_users.group_id=billing_group.group_id  LEFT JOIN users AS user1 ON user1.id=billing_group_users.user_id  WHERE users2.is_group=2 AND billing_group_users.user_id=" +
    req.query.login_user_id +
    condition +
    " AND YEAR(billing_group.event_date) = YEAR(CURDATE()) AND MONTH(billing_group.event_date) = MONTH(CURDATE())   AND   billing_group.event_date>= CURDATE()  Limit " +
    page * 10 +
    ",10";
  console.log(sql);
  connection.query(sql, function (err, groupUsers) {
    var sqlCountsDM =
      "SELECT n1.id  FROM chats AS n1    LEFT JOIN chats n2 ON n2.group_id=n1.group_id     LEFT JOIN groups_users ON groups_users.group_id=n1.group_id       LEFT JOIN users ON users.id=n1.group_id      LEFT JOIN users ON users.id=n1.send_by     WHERE ( n1.sent_to=" +
      req.query.login_user_id +
      " ) OR (groups_users.user_id=" +
      req.query.login_user_id +
      ") AND n1.id!=n2.id AND (n1.id>n2.id OR n2.id is null   )  GROUP BY n1.send_by,n1.sent_to ";

    console.log("sqlCountsDM============>>", sqlCountsDM);

    var sqlCountsSplit =
      "SELECT COUNT(*) AS counts FROM users AS users2 LEFT JOIN billing_group ON billing_group.group_id=users2.id  LEFT JOIN billing_group_users ON billing_group_users.group_id=billing_group.group_id  LEFT JOIN users AS user1 ON user1.id=billing_group_users.user_id  WHERE users2.is_group=2 AND user1.id=" +
      req.query.login_user_id +
      condition;

    connection.query(sqlCountsSplit, async function (err, sqlCountsSplitResult) {
      if (err) {
        console.log(err);
      }

      // connection.query(sqlCountsDM, function (err, sqlCountsDMResult) {
      //   if (err) {
      //     console.log(err);
      //   }
      //   console.log(sqlCountsDMResult,"==========sqlCountsDMResult")
      //   if(sqlCountsDMResult.length){

      //   }

      if (groupUsers.length > 0) {

// for(let i=0;i<groupUsers.length-1;i++){

var week=[];
var month=[];

await groupUsers.forEach(element => {
if( element.WMTag =="This week"){
  week.push(element)
}else{
  month.push(element)
}
 
});




        return res.json({
          // response: groupUsers,
          response: {weekEvents:week,
          monthEvents:month},
          // DMCounts: sqlCountsDMResult.length,
          splitCount: sqlCountsSplitResult[0].counts,
          success: true,
          message: "Direct message list",
        });
      } else {
        return res.json({
          response: [],
          // DMCounts: sqlCountsDMResult.length,
          splitCount: sqlCountsSplitResult[0].counts,
          success: true,
          message: "No More post",
        });
      }
      // });
    });
  });
};

exports.leftGroup = function (req, res) {
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
      message: "Added.",
    });
  } else {
    let sql =
      "DELETE FROM groups_users WHERE group_id =" +
      req.body.group_id +
      "  AND user_id=" +
      req.body.login_user_id;
    connection.query(sql, async (error) => {
      if (error) {
        console.log(error);
      } else {
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
    "SELECT users.id,users.type AS group_type ,users.name AS group_name,( SELECT GROUP_CONCAT(u1.profile_picture) FROM users AS u1 LEFT JOIN groups_users ON groups_users.user_id=u1.id WHERE groups_users.group_id=users.id AND groups_users.user_id!=" +
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

    sql =
      "SELECT users.*, " +
      a +
      "  FROM groups_users  LEFT JOIN users ON users.id=groups_users.user_id WHERE groups_users.group_id=" +
      req.query.group_id;
    console.log(sql);
    connection.query(sql, function (err, groupUsers) {
      console.log(err);
      var sqlCounts =
        "SELECT groups_users.id  FROM groups_users  LEFT JOIN users ON users.id=groups_users.user_id WHERE groups_users.group_id=" +
        req.query.group_id;
      connection.query(sqlCounts, function (err, group_user_count) {
        if (err) {
          console.log(err);
        }
        if (groupUsers.length > 0) {
          return res.json({
            response: { grop: group_details, users: groupUsers },
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
