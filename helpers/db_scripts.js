var constants = require("../config/constants");
const connection = require("../config/db");

const db_sql = {
  'Q1': " SELECT users.name,users.last_name,users.profile_picture,bgu.payment_amount FROM `users` LEFT JOIN billing_group_users bgu ON bgu.user_id=users.id WHERE bgu.group_id={var1} AND bgu.payment_amount {var2}",
  'Q3': " SELECT users.name,users.last_name,users.profile_picture,bgu.payment_amount FROM `users` LEFT JOIN billing_group_users bgu ON bgu.user_id=users.id WHERE bgu.group_id={var1} AND bgu.payment_amount IS  NULL",
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
