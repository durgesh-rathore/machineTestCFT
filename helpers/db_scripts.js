var constants = require("../config/constants");
const connection = require("../config/db");
var a =
  "CASE WHEN users.profile_picture IS NOT NULL THEN CONCAT('" +
  constants.BASE_URL +
  "images/profiles/',users.profile_picture)  ELSE '' END AS profile_picture";

const db_sql = {
  'Q1': " SELECT users.id,users.name, "+a +" ,bgu.payment_amount FROM `users` LEFT JOIN billing_group_users bgu ON bgu.user_id=users.id WHERE bgu.group_id={var1} AND bgu.payment_amount {var2}",
  'Q2': " SELECT profile_picture FROM users WHERE id={var1}"
  
};
// IS  NOT NULL

function dbScript(template, variables) {
  if (variables != null && Object.keys(variables).length > 0) {
    template = template.replace(
      new RegExp("{([^{]+)}", "g"),
      (_unused, varName) => {
        return variables[varName];
      }
    );
  }
  template = template.replace(/'null'/g, null);
  return template;
}

const queryAsync = async (sql) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = { db_sql, dbScript, queryAsync };
