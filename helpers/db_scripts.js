var constants = require("../config/constants");
const connection = require("../config/db");
var a =
  "CASE WHEN users.profile_picture IS NOT NULL THEN CONCAT('" +
  constants.BASE_URL +
  "images/profiles/',users.profile_picture)  ELSE '' END AS profile_picture";

const db_sql = {
  'Q1': " SELECT users.id,users.name, "+a +" ,bgu.payment_amount FROM `users` LEFT JOIN billing_group_users bgu ON bgu.user_id=users.id WHERE bgu.group_id={var1} AND bgu.status= {var2}",
  'Q2': " SELECT profile_picture FROM users WHERE id={var1}",
  'Q3': " SELECT * FROM users WHERE id={var1}",
  'Q4': " SELECT * FROM chat_seen_in_group_by_user AS csg WHERE csg.group_id={var1} AND csg.user_id={var2} ORDER BY id  DESC LIMIT 1",
  'Q5': " SELECT chats.*,"+a+" FROM `chats` LEFT JOIN users ON users.id=chats.send_by WHERE chats.sent_to={var1} AND chats.id>{var2} ORDER BY chats.id DESC  Limit 0,5",
  'Q6':"SELECT chats.* FROM `chats` LEFT JOIN users ON users.id=chats.send_by WHERE chats.send_by IN({var1},{var2}) AND chats.sent_to IN({var1},{var2}) {var3} ORDER BY chats.id DESC Limit 1",
  'Q7':"SELECT chats.* FROM `chats` LEFT JOIN users ON users.id=chats.send_by WHERE chats.sent_to={var1}    {var2} ORDER BY chats.id DESC  Limit 1",
  'Q8':"SELECT from_chat_id FROM chat_seen_in_group_by_user  WHERE user_id={var1}  AND seen_chat_user_id= {var2} ORDER BY id DESC  Limit 1",
  'Q9':"SELECT  at_chat_id  FROM groups_users WHERE group_id = {var1} AND user_id = {var2} AND is_not_exist = 1",
  'Q10':" SELECT id FROM chats WHERE sent_to={var1} ORDER BY id DESC LIMIT 1",
  'Q11':"SELECT id  FROM groups_users WHERE group_id = {var1} AND user_id = {var2}",
  'Q12':"SELECT u.name  FROM `users` AS group_ LEFT JOIN users u ON u.id=group_.group_admin_id WHERE group_.id = {var1}",
  'Q13':`SELECT
  GROUP_CONCAT(
    CASE
      WHEN id = {var1} THEN CONCAT(name, ' and you')
      ELSE name
    END
    ORDER BY
      CASE
        WHEN id = {var1} THEN 0
        ELSE 1
      END DESC
    SEPARATOR ', '
  ) AS concatenated_names
FROM users
WHERE id IN ({var2})`,
'Q14': " SELECT * FROM users WHERE id={var1} AND group_admin_id={var2}",
'Q15': " DELETE FROM users WHERE id={var1} AND group_admin_id={var2}",
'Q16': " DELETE FROM groups_users WHERE  group_id={var1}",
'Q17': " DELETE FROM chats WHERE  sent_to={var1} AND is_group=1",

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
