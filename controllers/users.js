var jwt = require("jsonwebtoken");
var connection = require("../config/db");
var constants = require("../config/constants");
var { encryptPassword, checkPassword } = require("../config/custom");
var { sendMail, save, findByIdAndUpdate } = require("../helpers/helper");
var multer = require("multer");
const path = require("path");
const { db_sql, dbScript, queryAsync } = require("../helpers/db_scripts");
const fs = require("fs");

exports.signup = function (req, res) {
  try {
    console.log(req.body, "req.body");
    if (
      req.body.name == "" ||
      req.body.email == "" ||
      req.body.password == "" ||
      req.body.mobile_number == ""
    ) {
      return res.json({ success: false, message: "All fields are required." });
    } else {
      if (req.body.password.length < 8) {
        return res.json({
          success: false,
          message: "Minimum 8 character in password .",
        });
      }

      connection.query(
        "SELECT id FROM users WHERE email = ?",
        req.body.email,
        async function (err, users) {
          if (users.length > 0) {
            return res.json({
              success: false,
              message: "Email id already exists.",
            });
          } else {
            connection.query(
              "SELECT id FROM users WHERE mobile_number = ?",
              req.body.mobile_number,
              async function (err, users) {
                if (users.length > 0) {
                  return res.json({
                    success: false,
                    message: "Mobile number already exists.",
                  });
                } else {
                  let password = await encryptPassword(req.body.password);
                  var newUser = {
                    name: req.body.name,
                    email: req.body.email.toLowerCase(),
                    password: password,
                    mobile_number: req.body.mobile_number,
                  };
                  if (
                    req.body.divice_token &&
                    req.body.divice_token != "undefined" &&
                    req.body.divice_token != "null"
                  ) {
                    newUser.divice_token = req.body.divice_token;
                  }
                  connection.query(
                    "INSERT INTO users SET ?",
                    newUser,
                    async function (err, user) {
                      if (err) throw err;
                      if (user) {
                        var token = jwt.sign(
                          { id: user.insertId },
                          constants.SECRET,
                          {
                            expiresIn: "7d", // expires in 24 hours
                          }
                        );
                        return res.json({
                          success: true,
                          user_id: user.insertId,
                          token: "JWT " + token,
                          name: req.body.name,
                          profile_picture: null,
                          message: "Signup successfully.",
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
    }
  } catch (error) {
    console.error(error);
  }
};

exports.signin = async function (req, res) {
  if (!req.body.email) {
    res.json({ success: false, message: "Email id is required." });
  } else if (!req.body.password) {
    res.json({ success: false, message: "Password is required." });
  } else {
    connection.query(
      "SELECT users.*, CASE WHEN users.profile_picture IS NOT NULL THEN CONCAT('" +
        constants.BASE_URL +
        "','images/profiles/',users.profile_picture) ELSE '' END AS profile_picture FROM users WHERE users.email = '" +
        req.body.email +
        "'",
      async function (err, users) {
        if (users.length > 0) {
          var Password = "";
          if (users[0].is_reset == 1) {
            Password = await checkPassword(
              req.body.password,
              users[0].dumy_password
            );
          } else {
            Password = await checkPassword(
              req.body.password,
              users[0].password
            );
          }

          if (Password) {
            var token = jwt.sign({ id: users[0].id }, constants.SECRET, {
              expiresIn: "7d", // expires in 24 hours
            });
            if (users[0].is_reset == 1) {
              return res.json({
                success: true,
                response: users[0],
                message: "Login successfully.",
              });
            } else {
              if (
                req.body.divice_token &&
                req.body.divice_token != "undefined" &&
                req.body.divice_token != "null"
              ) {
                var j = await findByIdAndUpdate(
                  "users",
                  { divice_token: req.body.divice_token },
                  " id=" + users[0].id
                );
                console.log("   dddddddddddd update divice token==", j);
              }
              return res.json({
                success: true,
                token: "JWT " + token,
                response: users[0],
                message: "Login successfully.",
              });
            }
          } else {
            return res.json({ success: false, message: "Password not match." });
          }
        } else {
          return res.json({ success: false, message: "Email id not match." });
        }
      }
    );
  }
};

exports.socialLogin = async function (req, res) {
  console.log("socialLogin==========",req.body);
  if (!req.body.email) {
    res.json({ success: false, message: "Email id is required." });
  } else {
    connection.query(
      "SELECT users.*, CASE WHEN users.profile_picture IS NOT NULL THEN CONCAT('" +
        constants.BASE_URL +
        "','images/profiles/',users.profile_picture) ELSE '' END AS profile_picture FROM users WHERE users.email = '" +
        req.body.email +
        "'",
      async function (err, users) {
        if (users.length > 0) {
          if(req.body.is_signup==1){
            return res.json({
              success: false,
              message: "User Already exist.",
            });
          }else
          if ((users[0].is_gogle_login = 0) && false) {
            return res.json({
              success: false,
              message: "User Already exist.",
            });
          } else {
            if (
              req.body.auth_token != "" ||
              req.body.auth_token != null ||
              req.body.auth_token != undefined
            ) {
              connection.query(
                "UPDATE users SET auth_token='" +
                  req.body.auth_token +
                  "' WHERE id=" +
                  users[0].id +
                  " ",
                async function (err, user) {
                  if (err) throw err;
                  if (user) {
                  }
                }
              );
            }

            var token = jwt.sign({ id: users[0].id }, constants.SECRET, {
              expiresIn: "7d", // expires in 24 hours
            });
            return res.json({
              success: true,
              token: "JWT " + token,
              response: users[0],
              message: "Login successfully.",
            });
          }
        } else {
          // let password = await encryptPassword(req.body.password);
          var newUser = {
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            is_gogle_login: 1,
             };
          if (
            req.body.divice_token &&
            req.body.divice_token != "undefined" &&
            req.body.divice_token != "null"
          ) {
            newUser.divice_token = req.body.divice_token;
          }
          if(req.body.is_signup==1){
          connection.query(
            "INSERT INTO users SET ?",
            newUser,
            async function (err, user) {
              if (err) throw err;
              if (user) {
                var token = jwt.sign({ id: user.insertId }, constants.SECRET, {
                  expiresIn: "7d", // expires in 24 hours
                });
                return res.json({
                  success: true,
                  token: "JWT " + token,
                  response:{  id: user.insertId,
                               name: req.body.name,
                               profile_picture: null,
                               profie_step:0
                  },
                  message: "Signup successfully.",
                });
              }
            }
          );
          }else{
            return res.json({
              success: false,
              message: "User dosen't exits Please signup .",
            });
          }
        }
      }
    );
  }
};

exports.getInterestList = function (req, res) {
  var page = req.query.page ? req.query.page : 0;
  connection.query(
    "SELECT * FROM colors Limit " + page + ",8",
    function (err, colors) {
      if (colors.length > 0) {
        connection.query(
          "SELECT * FROM interests Limit " + page + ",9",
          function (err, interests) {
            if (colors.length > 0) {
              return res.json({
                response: { colors: colors, interests: interests },
                success: true,
                message: "Color list and Interest field list",
              });
            }
          }
        );
      }
    }
  );
};

exports.userInterest = function (req, res) {
  if (!req.body || !req.body.user_id || !req.body.interest_fields) {
    return res.json({
      success: false,
      message: "Please enter required  detail.",
    });
  } else {
    connection.query(
      "SELECT * FROM users WHERE id = ?",
      req.body.user_id,
      function (err, users) {
        if (users.length <= 0) {
          return res.json({
            success: false,
            message: "Please enter required  detail.",
          });
        } else {
          JSON.parse(req.body.interest_fields).forEach((element) => {
            var obj = {
              user_id: req.body.user_id,
              interest_id: element,
            };

            save("users_interest", obj);
            obj = {};
          });
          return res.json({
            success: true,
            message: "Interest fields save succesful.",
          });
        }
      }
    );
  }
};

exports.userFavoriteColors = function (req, res) {
  if (!req.body || !req.body.user_id || !req.body.favorite_colors) {
    return res.json({
      success: false,
      message: "Please enter required  detail.",
    });
  } else {
    connection.query(
      "SELECT * FROM users WHERE id = ?",
      req.body.user_id,
      function (err, users) {
        if (users.length <= 0) {
          return res.json({
            success: false,
            message: "Please enter required  detail.",
          });
        } else {
          var sql =
            "UPDATE users SET favorite_colors	 = '" +
            req.body.favorite_colors +
            "'	 WHERE id = " +
            req.body.user_id +
            "";
          console.log("=======", sql);
          connection.query(sql, function (err, result) {
            if (err) {
              return res.json({
                success: false,
                message: "Something went wrong.",
              });
            } else {
              return res.json({
                success: true,
                message: "Favorite colors save succesful.",
              });
            }
          });
        }
      }
    );
  }
};

exports.forgotPassword = async function (req, res) {
  if (req.body.email == undefined || req.body.email == "") {
    return res.json({ success: true, message: "Please enter email id" });
  } else {
    var sql = 'SELECT * FROM users WHERE  email="' + req.body.email + '"';
    console.log(sql, "sql");
    connection.query(sql, async function (err, users) {
      if (err) {
        console.log("======", err);
      } else if (users.length > 0) {
        var otp = Math.floor(1000 + Math.random() * 90000000);
        console.log("otp===========", otp);
        let password = await encryptPassword(otp + "");

        connection.query(
          "UPDATE users SET  is_reset=1 ,dumy_password='" +
            password +
            "'  WHERE id= " +
            users[0].id,
          function (err, campaign) {
            console.log(err, "err");
            if (!err) {
              // send email of this email id
              var data = {
                email: req.body.email,
                password: otp,
              };

              sendMail(data);
              return res.json({
                success: true,
                message: "Password  sent on your email id",
                otp: otp,
                response: users[0],
              });
            }
          }
        );
      } else {
        return res.json({ success: false, message: "Email Id not exist" });
      }
    });
  }
};

exports.resetPassword = async function (req, res) {
  if (
    req.body.user_id == undefined ||
    req.body.user_id == "" ||
    req.body.password == ""
  ) {
    return res.json({ success: false, message: "Please Enter Valid" });
  } else {
    if (req.body.password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be 8 character",
      });
    }
    let password = await encryptPassword(req.body.password);

    sql =
      "UPDATE users SET is_reset=0,password = '" +
      password +
      "'  WHERE id = '" +
      req.body.user_id +
      "'";

    connection.query(sql, function (err, result) {
      if (err) {
        console.log("error-=======", err);
      } else {
        return res.json({ success: true, message: "Password reset." });
      }
    });
  }
};

exports.changePassword = async function (req, res) {
  if (
    req.body.user_id == undefined ||
    req.body.user_id == "" ||
    req.body.old_password == "" ||
    req.body.new_password == ""
  ) {
    return res.json({ success: false, message: "Please Enter Valid" });
  } else {
    if (req.body.new_password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be 8 character",
      });
    }

    connection.query(
      "SELECT users.password FROM users WHERE users.id = '" +
        req.body.user_id +
        "'",
      async function (err, users) {
        if (users.length > 0) {
          var is_Password = "";
          is_Password = await checkPassword(
            req.body.old_password,
            users[0].password
          );
        }

        if (is_Password) {
          let password = await encryptPassword(req.body.new_password);

          sql =
            "UPDATE users SET password = '" +
            password +
            "'  WHERE id = '" +
            req.body.user_id +
            "'";

          connection.query(sql, function (err, result) {
            if (err) {
              console.log("error-=======", err);
            } else {
              return res.json({ success: true, message: "Password reset." });
            }
          });
        } else {
          return res.json({
            success: false,
            message: "Old password is wrong.",
          });
        }
      }
    );
  }
};

exports.getProfile = function (req, res) {
  if (!req.query.login_user_id) {
    return res.json({
      success: false,
      message: "You not login user.",
    });
  } else {
    connection.query(
      "SELECT users.dob,users.mobile_number,users.created_datetime,email,users.id,users.name,CONCAT('" +
        constants.BASE_URL +
        "','images/profiles/',users.profile_picture) AS profile_picture,(SELECT COUNT(*) FROM users_requests WHERE users_requests.request_for=users.id AND users_requests.is_follow=1 ) AS following_count,(SELECT COUNT(*) FROM users_requests WHERE users_requests.request_for=users.id AND users_requests.is_follow=1 AND users_requests.is_accepted=1 ) AS followers_count  FROM users  WHERE users.id = " +
        req.query.login_user_id +
        "",
      function (err, users) {
        console.log(err);

        return res.json({
          success: true,
          message: "user profile",
          response: users[0],
        });
      }
    );
  }
};

exports.updateUserProfile = function (req, res) {
  try {
    console.log(req.body, "req.body");
    if (
      req.body.name == "" ||
      req.body.name == undefined ||
      req.body.login_user_id == undefined ||
      req.body.login_user_id == null ||
      req.body.login_user_id == ""
    ) {
      return res.json({ success: false, message: "All fields are required." });
    } else {
      connection.query(
        "SELECT id FROM users WHERE mobile_number = ? AND id!=" +
          req.body.login_user_id,
        req.body.mobile_number,
        async function (err, users) {
          if (users.length > 0) {
            return res.json({
              success: false,
              message: "Mobile number already exists.",
            });
          } else {
            var newUser = {
              name: req.body.name,
              mobile_number: req.body.mobile_number,
            };
            if (
              req.body.dob != "" &&
              req.body.dob != undefined &&
              req.body.dob != null
            ) {
              newUser.dob = req.body.dob;
            }

            if (
              req.body.last_name != "" &&
              req.body.last_name != undefined &&
              req.body.last_name != null
            ) {
              newUser.last_name = last_name;
            }
            if (
              req.file &&
              req.file.filename != "" &&
              req.file.filename != undefined
            ) {
              newUser.profile_picture = req.file.filename;
              let s2 = await dbScript(db_sql["Q2"], {
                var1: req.body.login_user_id,
              });
              let user = await queryAsync(s2);

              fs.unlink(
                "./public/images/profiles/" + user[0].profile_picture,
                function (err) {}
              );
            }
            connection.query(
              "UPDATE users SET ? WHERE id=" + req.body.login_user_id + " ",
              newUser,
              async function (err, user) {
                console.log("err===", err);
                if (err) throw err;
                if (user) {
                  return res.json({
                    success: true,
                    user_id: user.insertId,
                    message: "Update profile successful.",
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
  } catch (error) {
    console.error(error);
  }
};

async function x() {
  console.log("in x method ====");
  // /home/user/Desktop/durgesh/ForgetMeNote/forgetmenote/public/images/profiles/Rectangle21png-1681901239083.png
  fs.unlink(
    "./public/images/profiles/" + "Rectangle21png-1681901239083.png",
    function (err) {
      console.log(err);
    }
  );
}
