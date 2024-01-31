var jwt = require("jsonwebtoken");
var connection = require("../config/db");
var constants = require("../config/constants");
const { body, validationResult } = require('express-validator');

var { encryptPassword, checkPassword } = require("../config/custom");
exports.signup = function (req, res) {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
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
                    
                  };
                 
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

                        const sessionId = Math.random().toString(36).substring(7);

                        // Store user information in the session
                        req.session.user = { user_id:user.insertId , sessionId };
                    
                        // Add the session to the list of active sessions
                        activeSessions[sessionId] = req.sessionID;

                        res.cookie('token', token, { httpOnly: true });
                        return res.json({
                          success: true,
                          user_id: user.insertId,
                          token: "JWT " + token,
                          name: req.body.name,
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  if (!req.body.email) {
    res.json({ success: false, message: "Email id is required." });
  } else if (!req.body.password) {
    res.json({ success: false, message: "Password is required." });
  } else {
    connection.query(
      "SELECT * FROM users WHERE users.email = '" +
        req.body.email +
        "'",
      async function (err, users) {
        if (users.length > 0) {
          let Password = "";
                Password = await checkPassword(
              req.body.password,
              users[0].password
            );
          
          if (Password) {
            var token = jwt.sign({ id: users[0].id }, constants.SECRET, {
              expiresIn: "7d", // expires in 24 hours
            });
            res.cookie('token', token, { httpOnly: true });
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



exports.userList = function (req, res) {
  try {
    let sql=`SELECT users.name,users.id, 
                ( SELECT COUNT(chats.id)  FROM chats
                   WHERE 
                    (chats.sent_by=${ req.query.login_user_id} AND chats.sent_to=users.id) 
                    OR (chats.sent_by=users.id AND chats.sent_to=${ req.query.login_user_id}) ) 
                  AS newMessageCount
               FROM  users  WHERE role=2 `;
               console.log(sql," dddddd");
    
      connection.query(sql,     
      async function (err, userList) {
        if (userList.length >=0) {
          return res.json({
            response:userList,
            success: true,
            message: "Users list.",
          });
        } else {
          return res.json({
            success: false,
            message: "Something went wrong.",
          });
        }
      }
    );
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Something went wrong.",
      error:error
    });
  }
};

