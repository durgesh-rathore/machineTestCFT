var jwt = require("jsonwebtoken");
var connection = require("../config/db");
var constants = require("../config/constants");
var { encryptPassword, checkPassword } = require("../config/custom");
// var helper = require('../../Helpers/helper');
var multer = require("multer");
const path = require("path");
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
                  connection.query(
                    "INSERT INTO users SET ?",
                    newUser,
                    async function (err, user) {
                      if (err) throw err;
                      if (user) {
                        return res.json({
                          success: true,
                          response: user.insertId,
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
      'SELECT users.* FROM users WHERE users.email = "' + req.body.email + '"',
      async function (err, users) {
        if (users.length > 0) {
          var Password = "";
          if (users[0].is_reset==1) {
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
          var sql =
            "UPDATE users SET interest_fields	 = '" +
            req.body.interest_fields +
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
                message: "Interest fields save succesful.",
              });
            }
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
    var sql =
      'SELECT * FROM users WHERE  email="' +
      req.body.email +
      '"';
    console.log(sql, "sql");
    connection.query(sql, async function (err, users) {
      if (err) {
        console.log("======", err);
      } else if (users.length > 0) {
        var otp = Math.floor(1000 + Math.random() * 90000000);
        console.log("otp===========",otp);
        let password = await encryptPassword(otp+"");

        connection.query(
          "UPDATE users SET  is_reset=1 ,dumy_password='" + password + "'  WHERE id= " + users[0].id,
          function (err, campaign) {
            console.log(err, "err");
            if (!err) {
// send email of this email id
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
        return res.json({ success: true, message: "Email Id not exist" });
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
    if(req.body.password.length<8){
      return res.json({ success: false, message: "Password must be 8 character" });
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
