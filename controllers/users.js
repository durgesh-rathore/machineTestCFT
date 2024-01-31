var jwt = require("jsonwebtoken");
var connection = require("../config/db");
var constants = require("../config/constants");
var { encryptPassword, checkPassword } = require("../config/custom");
var { sendMail, save, findByIdAndUpdate } = require("../helpers/helper");
var multer = require("multer");
const path = require("path");

const fs = require("fs");

exports.signup = function (req, res) {
  try {
    
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
                    profie_step:1
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
exports.logout = async function (req, res) {
  
                var j = await findByIdAndUpdate(
                  "users",
                  { divice_token: null },
                  " id=" + req.body.login_user_id
                );
                
              
              return res.json({
                success: true,
                message: "Logout successfully.",
              });
            
};

