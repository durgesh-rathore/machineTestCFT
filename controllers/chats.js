var jwt = require("jsonwebtoken");
var connection = require("../config/db");
var constants = require("../config/constants");
var { encryptPassword } = require("../config/custom");

exports.getChats = function (req, res) {
  try {
    let sql=`SELECT chats.*,users.name FROM  chats LEFT JOIN users ON users.id = chats.sent_by 
        WHERE  (chats.sent_by=${ req.body.login_user_id} AND chats.sent_to=${ req.body.selected_user_id}) 
              OR (chats.sent_by=${ req.body.selected_user_id} AND chats.sent_to=${ req.body.login_user_id})  `;
    
      connection.query(sql,     
      async function (err, chatsList) {
        if (chatsList.length >=0) {
          return res.json({
            response:chatsList,
            success: true,
            message: "Messages list.",
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
