var jwt = require("jsonwebtoken");
var connection = require("../config/db");
var constants = require("../config/constants");
var { encryptPassword, checkPassword } = require("../config/custom");
var multer = require("multer");
const path = require("path");
const fs = require("fs");
var a =
  "CASE WHEN users.profile_picture IS NOT NULL THEN CONCAT('" +
  constants.BASE_URL +
  "images/profiles/',users.profile_picture)  ELSE '' END AS profile_picture";



exports.followUser = function (req, res) {
  if (req.body.login_user_id && req.body.request_for) {
    connection.query(
      "SELECT * FROM users_requests WHERE ( user_id=" +
        req.body.login_user_id +
        " AND request_for=" +
        req.body.request_for +
        ") OR ( request_for=" +
        req.body.login_user_id +
        " AND user_id=" +
        req.body.request_for +
        " )",
      function (err, usersRequest) {
        if (usersRequest.length > 0) {
          if (usersRequest[0].is_both_follow == 1) {
            return res.json({
              success: true,
              message: "Already following.",
            });
          } else {
            var forf = " is_both_follow=1  ";
            if (usersRequest[0].is_follow == 0) {
              if (req.body.login_user_id == usersRequest[0].request_for) {
                forf =
                  "  is_follow=1,user_id=" +
                  usersRequest[0].request_for +
                  ",request_for=" +
                  usersRequest[0].user_id +
                  "  ";
              } else if (req.body.login_user_id == usersRequest[0].user_id) {
                forf = " is_follow=1 ";
              }
            }
            connection.query(
              " UPDATE users_requests SET " +
                forf +
                "  WHERE ( user_id=" +
                req.body.login_user_id +
                " AND request_for=" +
                req.body.request_for +
                ") OR ( request_for=" +
                req.body.login_user_id +
                " AND user_id=" +
                req.body.request_for +
                " )",

              async function (err, result) {
                if (err) throw err;
                if (result) {
                  return res.json({
                    success: true,
                    response: result.insertId,
                    message: "followed.",
                  });
                }
              }
            );
          }
        } else {
          var users_request = {
            user_id: req.body.login_user_id,
            request_for: req.body.request_for,
            is_follow: 1,
            //  suppose:55
          };
          connection.query(
            "INSERT INTO users_requests SET ?",
            users_request,
            async function (err, result) {
              if (err) throw err;
              console.log("follow", err);
              if (result) {
                return res.json({
                  success: true,

                  message: "Follow .",
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
};
exports.requestForUser = function (req, res) {
  if (req.body.login_user_id && req.body.request_for) {
    connection.query(
      "SELECT * FROM users_requests WHERE ( user_id=" +
        req.body.login_user_id +
        " AND request_for=" +
        req.body.request_for +
        ") OR ( request_for=" +
        req.body.login_user_id +
        " AND user_id=" +
        req.body.request_for +
        " )",
      function (err, usersRequest) {
        if (usersRequest.length > 0) {
          return res.json({
            success: true,
            message: "Already requested.",
          });
        } else {
          var users_request = {
            user_id: req.body.login_user_id,
            request_for: req.body.request_for,
            request_by: req.body.login_user_id,
            is_request: 1,
            //  suppose:55
          };
          connection.query(
            "INSERT INTO users_requests SET ?",
            users_request,
            async function (err, result) {
              if (err) throw err;
              console.log("Request button api", err);
              if (result) {
                return res.json({
                  success: true,
                  message: "Request .",
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
};
exports.unFollowUser = function (req, res) {
  if (req.body.login_user_id && req.body.request_for) {
    connection.query(
      "SELECT * FROM users_requests WHERE ( user_id=" +
        req.body.login_user_id +
        " AND request_for=" +
        req.body.request_for +
        ") OR ( request_for=" +
        req.body.login_user_id +
        " AND user_id=" +
        req.body.request_for +
        " )",
      function (err, usersRequest) {
        if (usersRequest.length > 0) {
          var updateSql = " ";
          if (usersRequest[0].is_both_follow == 1) {
            if (req.body.login_user_id == usersRequest[0].request_for) {
              updateSql =
                " UPDATE users_requests SET is_both_follow=0  WHERE id= " +
                usersRequest[0].id;
            } else if (req.body.login_user_id == usersRequest[0].user_id) {
              updateSql =
                " UPDATE users_requests SET  user_id=" +
                usersRequest[0].request_for +
                ",request_for=" +
                usersRequest[0].user_id +
                ", is_both_follow=0  WHERE id= " +
                usersRequest[0].id;
            }
          } else {
            updateSql =
              " UPDATE users_requests SET is_follow=0  WHERE id= " +
              usersRequest[0].id;
          }
          connection.query(updateSql, async function (err, result) {
            if (err) throw err;
            if (result) {
              return res.json({
                success: true,
                response: result.insertId,
                message: "Unfollow .",
              });
            } else {
              return res.json({
                success: false,
                message: "Something went wrong.",
              });
            }
          });
        }
      }
    );
  }
};

exports.rejectUser = function (req, res) {
  if (req.body.login_user_id && req.body.request_for) {
    connection.query(
      "SELECT * FROM users_requests WHERE  user_id=" +
        req.body.login_user_id +
        " AND request_for=" +
        req.body.request_for,
      function (err, usersRequest) {
        if (usersRequest.length > 0) {
          connection.query(
            " UPDATE users_requests SET is_reject=1  WHERE user_id=" +
              req.body.login_user_id +
              " AND request_for=" +
              req.body.request_for,
            async function (err, result) {
              if (err) throw err;
              if (result) {
                return res.json({
                  success: true,
                  message: "Rejected .",
                });
              } else {
                return res.json({
                  success: false,
                  message: "Something went wrong.",
                });
              }
            }
          );
        } else {
          var users_request = {
            user_id: req.body.login_user_id,
            request_for: req.body.request_for,
            is_reject: 1,
          };

          connection.query(
            "INSERT INTO users_requests SET ?",
            users_request,
            async function (err, result) {
              if (err) throw err;
              if (result) {
                return res.json({
                  success: true,

                  message: "Rejected .",
                });
              }
            }
          );
        }
      }
    );
  }
};
exports.blockUser = function (req, res) {
  if (req.body.login_user_id && req.body.request_for) {
    connection.query(
      " UPDATE users_requests SET is_block=" +
        req.body.is_block +
        "  WHERE ( user_id=" +
        req.body.login_user_id +
        " AND request_for=" +
        req.body.request_for +
        ") OR ( request_for=" +
        req.body.login_user_id +
        " AND user_id=" +
        req.body.request_for +
        " )",

      async function (err, result) {
        if (err) throw err;
        if (result) {
          if (req.body.is_block == "1") {
            return res.json({
              success: true,
              response: result.insertId,
              message: "blocked .",
            });
          } else {
            return res.json({
              success: true,
              response: result.insertId,
              message: "Unblocked .",
            });
          }
        } else {
          return res.json({
            success: false,
            message: "Something went wrong.",
          });
        }
      }
    );
  }
};

exports.acceptRequest = function (req, res) {
  if (req.body.login_user_id && req.body.request_for) {
    connection.query(
      " UPDATE users_requests SET is_accepted=1  WHERE ( user_id=" +
        req.body.login_user_id +
        " AND request_for=" +
        req.body.request_for +
        ") OR ( request_for=" +
        req.body.login_user_id +
        " AND user_id=" +
        req.body.request_for +
        " )",

      async function (err, result) {
        if (err) throw err;
        if (result) {
          return res.json({
            success: true,

            message: "Accepted .",
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
};

exports.friendsList = function (req, res) {
  if (req.query.login_user_id) {
    var page = req.query.page ? req.query.page : 0;
    var condition = " ";
    if (
      req.query.search != "" &&
      req.query.search != undefined &&
      req.query.search != null
    ) {
      condition = '  AND (users.name LIKE "%' + req.query.search + '%") ';
    }

    if (req.query.type == "request") {
      var sql =
        "SELECT " +
        a +
        ",users.name, users_requests.*,users.id,(SELECT  COUNT(users_requests.request_for) FROM users_requests WHERE users_requests.is_follow!=0  AND users_requests.request_for=users.id ) AS followed_by  FROM users_requests LEFT JOIN users ON users.id=users_requests.user_id WHERE users_requests.request_for='" +
        req.query.login_user_id +
        "' AND  users_requests.is_request=1 AND users_requests.is_reject<>1 AND users_requests.is_block<>1 AND users_requests.is_accepted<>1 " +
        condition +
        " ORDER BY users.id DESC limit  " +
        page * 10 +
        ", 10";
      console.log("request ===", sql);
    }
    if (req.query.type == "allFriends") {
      var sql =
        "SELECT " +
        a +
        ",users.name,users_requests.*,users.id, (SELECT  COUNT(users_requests.request_for) FROM users_requests WHERE users_requests.is_follow!=0  AND users_requests.request_for=users.id ) AS followed_by  FROM users_requests LEFT JOIN users ON (   users.id =  case when users_requests.user_id!=" +
        req.query.login_user_id +
        " Then users_requests.user_id ELSE users_requests.request_for END)  WHERE  ( users_requests.user_id='" +
        req.query.login_user_id +
        " ' OR users_requests.request_for='" +
        req.query.login_user_id +
        "' )  AND users_requests.is_reject=0 AND users_requests.is_block=0 AND (users_requests.is_accepted=1   OR ((users_requests.is_request=1 OR users_requests.is_follow=1) AND (users_requests.user_id ='" +
        req.query.login_user_id +
        " ' OR users_requests.is_both_follow=1 ))   )   " +
        condition +
        "  ORDER BY users.id DESC  limit  " +
        page * 10 +
        ", 10";
      console.log("allFriends ===", sql);
    }
    if (req.query.type == "explore") {
      // users_requests.user_id IS NULL AND
      var sql =
        "SELECT " +
        a +
        ",users.name,users_requests.*,users.id, (SELECT  COUNT(users_requests.request_for) FROM users_requests WHERE users_requests.is_follow!=0  AND users_requests.request_for=users.id ) AS followed_by FROM users LEFT JOIN users_requests ON users_requests.request_for=users.id  LEFT JOIN users_requests UR ON UR.user_id=users.id       WHERE users.is_group=0     AND ( users_requests.user_id <>'" +
        req.query.login_user_id +
        "' OR users_requests.is_both_follow=0 OR (users_requests.is_both_follow IS null AND ( UR.request_for <>'" +
        req.query.login_user_id +
        "' OR UR.is_both_follow IS NULL OR UR.is_both_follow=0) ) )  AND users.id <>'" +
        req.query.login_user_id +
        "'  AND ( users_requests.request_for <>'" +
        req.query.login_user_id +
        "' OR users_requests.request_for IS NULL ) AND (users_requests.user_id <>'" +
        req.query.login_user_id +
        " ' OR users_requests.is_accepted=0 OR  users_requests.is_accepted IS NULL) AND ( users_requests.user_id <>'" +
        req.query.login_user_id +
        " ' OR users_requests.is_reject=0 OR users_requests.is_reject IS NULL ) AND (users_requests.user_id <>'" +
        req.query.login_user_id +
        " ' OR users_requests.is_request=0 OR users_requests.is_request IS NULL ) AND ((users_requests.user_id <>'" +
        req.query.login_user_id +
        " ' OR users_requests.is_follow=0 OR users_requests.is_follow IS NULL )  OR users_requests.user_id<> '" +
        req.query.login_user_id +
        "' )  " +
        condition +
        " GROUP BY users.id  ORDER BY users.id DESC  limit  " +
        page * 10 +
        ", 10";
      console.log("explore ===", sql);
    }
    //  AND ( users_requests.user_id!='" +
    // req.query.login_user_id +
    // "' OR  users_requests.user_id IS NULL)
    connection.query(sql, async function (err, users) {
      var sqlCount1 =
        "SELECT  COUNT(users.id) AS total_count FROM users LEFT JOIN users_requests ON users_requests.request_for=users.id  LEFT JOIN users_requests UR ON UR.user_id=users.id     WHERE users.is_group=0     AND ( users_requests.user_id <>'" +
        req.query.login_user_id +
        "' OR users_requests.is_both_follow=0 OR (users_requests.is_both_follow IS null AND ( UR.request_for <>'" +
        req.query.login_user_id +
        "' OR UR.is_both_follow IS NULL OR UR.is_both_follow=0) ) )  AND users.id <>'" +
        req.query.login_user_id +
        "'  AND ( users_requests.request_for <>'" +
        req.query.login_user_id +
        "' OR users_requests.request_for IS NULL ) AND (users_requests.user_id <>'" +
        req.query.login_user_id +
        " ' OR users_requests.is_accepted=0 OR  users_requests.is_accepted IS NULL) AND ( users_requests.user_id <>'" +
        req.query.login_user_id +
        " ' OR users_requests.is_reject=0 OR users_requests.is_reject IS NULL ) AND (users_requests.user_id <>'" +
        req.query.login_user_id +
        " ' OR users_requests.is_request=0 OR users_requests.is_request IS NULL ) AND ((users_requests.user_id <>'" +
        req.query.login_user_id +
        " ' OR users_requests.is_follow=0 OR users_requests.is_follow IS NULL )  OR users_requests.user_id<> '" +
        req.query.login_user_id +
        "' )  " +
        condition +
        " GROUP BY users.id";
      console.log("sqlCount1==========", sqlCount1);
      var sqlCountrequest =
        "SELECT COUNT(users_requests.user_id) AS total_count FROM users_requests LEFT JOIN users ON users.id=users_requests.user_id WHERE users_requests.request_for='" +
        req.query.login_user_id +
        "' AND  users_requests.is_request=1 AND users_requests.is_reject<>1 AND users_requests.is_block<>1 AND users_requests.is_accepted<>1 " +
        condition +
        "";

      var sqlCountAll =
        "SELECT COUNT(users_requests.user_id) AS total_count FROM users_requests LEFT JOIN users ON (   users.id =  case when users_requests.user_id!=" +
        req.query.login_user_id +
        " Then users_requests.user_id ELSE users_requests.request_for END)   WHERE  ( users_requests.user_id='" +
        req.query.login_user_id +
        " ' OR users_requests.request_for='" +
        req.query.login_user_id +
        "' )  AND users_requests.is_reject=0 AND users_requests.is_block=0 AND (users_requests.is_accepted=1   OR ((users_requests.is_request=1 OR users_requests.is_follow=1) AND ( users_requests.user_id ='" +
        req.query.login_user_id +
        " ' OR users_requests.is_both_follow=1 ) ) )   " +
        condition +
        "";
      connection.query(sqlCount1, async function (err, usersCountResult) {
        if (err) {
          console.log("====", err);
        } else {
          connection.query(
            sqlCountrequest,
            async function (err, sqlCountrequestResult) {
              if (err) {
                console.log("====", err);
              } else {
                connection.query(
                  sqlCountAll,
                  async function (err, sqlCountAllResult) {
                    if (err) {
                      console.log("====", err);
                    } else {
                      return res.json({
                        response: users,
                        requestTotalCount: sqlCountrequestResult[0].total_count,
                        exploreTotalCount: usersCountResult.length,
                        friendsTotalCount: sqlCountAllResult[0].total_count,
                        success: true,
                        message: "users list",
                      });
                    }
                  }
                );
              }
            }
          );
        }
      });
    });
  } else {
    return res.json({
      response: [],
      success: false,
      message: "Not valid user",
    });
  }
};

exports.getBlockUserList = function (req, res) {};

exports.friendsListForVisibitly = function (req, res) {
  console.log(req.query, " req.query ");
  if (req.query.login_user_id) {
    var page = req.query.page ? req.query.page : 0;
    var condition = " ";
    if (
      req.query.search != "" &&
      req.query.search != undefined &&
      req.query.search != null
    ) {
      condition = '  AND (users.name LIKE "%' + req.query.search + '%") ';
    }

    var sql =
      "SELECT  ( SELECT id FROM visibility WHERE visibility.user_id=users.id AND visibility.post_id=" +
      req.query.post_id +
      " ) AS is_checked, " +
      a +
      ",users.name,users_requests.*,users.id, (SELECT  COUNT(users_requests.request_for) FROM users_requests WHERE users_requests.is_follow!=0  AND users_requests.request_for=users.id ) AS followed_by  FROM users_requests LEFT JOIN users ON (   users.id =  case when users_requests.user_id!=" +
      req.query.login_user_id +
      " Then users_requests.user_id ELSE users_requests.request_for END)  WHERE  ( users_requests.user_id='" +
      req.query.login_user_id +
      " ' OR users_requests.request_for='" +
      req.query.login_user_id +
      "' )  AND users_requests.is_reject=0 AND users_requests.is_block=0 AND (users_requests.is_accepted=1   OR ((users_requests.is_request=1 OR users_requests.is_follow=1) AND users_requests.user_id ='" +
      req.query.login_user_id +
      " ')   )   " +
      condition +
      " limit  " +
      page * 10 +
      ", 10";
    console.log("allFriends ===", sql);

    connection.query(sql, async function (err, users) {
      var sqlCountAll =
        "SELECT COUNT(users_requests.user_id) AS total_count FROM users_requests LEFT JOIN users ON (   users.id =  case when users_requests.user_id!=" +
        req.query.login_user_id +
        " Then users_requests.user_id ELSE users_requests.request_for END)   WHERE  ( users_requests.user_id='" +
        req.query.login_user_id +
        " ' OR users_requests.request_for='" +
        req.query.login_user_id +
        "' )  AND users_requests.is_reject=0 AND users_requests.is_block=0 AND (users_requests.is_accepted=1   OR ((users_requests.is_request=1 OR users_requests.is_follow=1) AND users_requests.user_id ='" +
        req.query.login_user_id +
        " ')   )   " +
        condition +
        "";
      connection.query(sqlCountAll, async function (err, sqlCountAllResult) {
        if (err) {
          console.log("====", err);
        } else {
          return res.json({
            response: users,
            friendsTotalCount: sqlCountAllResult[0].total_count,
            success: true,
            message: "users list",
          });
        }
      });
    });
  } else {
    return res.json({
      response: [],
      success: false,
      message: "Not valid user",
    });
  }
};
