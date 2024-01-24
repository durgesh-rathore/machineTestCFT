var connection = require("./config/db");
var {
  save,
  findByIdAndUpdate,
  pushNotification2,
} = require("./helpers/helper");

var {
  db_sql, dbScript, queryAsync
} = require("./helpers/db_scripts");

var clients = [];

module.exports = (io) => {
  io.on("connection", (socket) => {
    // console.log("User has connect55");
    socket.on("disconnect", (_) => {
      const userId = Object.keys(clients).find(
        (key) => clients[key] === socket
      );
      if (userId) {
        // console.log("when disconted to the user from === ", userId);
        delete clients[userId];
      }

      // console.log("User disconnected");

      // socket.emit('user-disconnect');
      socket.disconnect();
    });

    socket.on("user-login", (uid) => {
      // console.log("user-login : ggg", uid);
      clients[uid.uid] = socket;
      sql =
        "SELECT users.id  FROM users  LEFT JOIN groups_users ON groups_users.group_id=users.id     WHERE groups_users.is_not_exist<>1 AND  users.is_group<>0 AND groups_users.user_id=" +
        uid.uid +
        " GROUP BY users.id ";
      // console.log("clients==================", clients, sql);
      connection.query(sql, function (err, roomNames) {
        console.log(err);
        // console.log("uid for ",uid,clients[uid.uid])
        roomNames.forEach((roomName) => {
          // console.log(" join room when login_event fire ===", roomName);
          socket.join(`chat-${roomName.id}`);
        });
      });
    });


    socket.on("forPushNotificationCount",  async ({ user_id,post_id,login_user_id    }) => {
      console.log("forPushNotificationCount : ggg", user_id,post_id,login_user_id);
      // clients[uid.uid] = socket;
      var sql=`SELECT COUNT(*) AS cou FROM notification WHERE user_id=${user_id} AND is_seen=0`;
      // console.log("clients==================", clients, sql);
      connection.query(sql, function (err, counts) {
        console.log(err);
        // console.log("uid for ",uid,clients[uid.uid])
         clients[user_id].emit('notificationCount', { message: counts[0].cou  });
      });
    });

    socket.on("user-setOffline", (uid) => {
      // console.log("user-offline : ", uid);
    });

  // Assume 'socket' is the user's Socket.IO socket instance

socket.on("user-join-room", ({ roomId }) => {
  // Check if the user is already in the room
  if (!isUserInRoom(roomId)) {
    // If not, join the room
    socket.join(`chat-${roomId}`);
    // console.log(`A user joined chat-${roomId}`);
  } else {
    // console.log(`User is already in chat-${roomId}`);
  }
});

socket.on("user-leave-room", (roomId) => {

  if (isUserInRoom(roomId)) {
    socket.leave(`chat-${roomId}`);
    console.log(`User left chat-${roomId}`);
  } else {
    console.log("User is not in any room to leave");
  }
});

// Function to check if a user is in a room
function isUserInRoom(roomId) {
  const rooms = Object.keys(socket.rooms);
  return rooms.includes(`chat-${roomId}`);
}

socket.on(
  "muteUser",
  async ({
    group_id,
    mute_user_id,
    forAdd,
    }) => {
    console.log(" in muteUser event call ",group_id,mute_user_id);

// clients[group_id].emit("muteUserReceive", {
//   group_id,
//   mute_user_id  
// });

socket.broadcast.to(`chat-${group_id}`).emit("muteUserReceive", {
   group_id,
  mute_user_id,
  forAdd  
});
})
    // {'send_by': userId,'sent_to' :'2', 'newMessage': message, 'name': login_userName,'group_id':''    ,'image': ''};
    socket.on(
      "user-send-message",
      async ({
        send_by,
        sent_to,
        newMessage,
        name,
        is_group,
        images,
        createdDatetime,
        profile_picture,
        mute_users,
        is_meta_data,
      }) => {
        if (
          images == "" ||
          images == null ||
          images == undefined ||
          (newMessage != "" && send_by != sent_to)
        ) {
          var data = {
            message: newMessage,
            send_by: send_by,
            sent_to: sent_to,
            is_group: is_group,
          };
          if (is_meta_data == 1) {
            data.is_meta_data = is_meta_data;
          }
          await save("chats", data);
        }
        console.log(
          "{ conversation, newMessage }========",
          send_by,
          sent_to,
          newMessage,
          name,
          is_group,
          images,
          createdDatetime,
          profile_picture
        );
        // socket
        // .to(`chat-${conversation._id}`)
        // console.log("============client==",clients)

        if (clients[sent_to] != undefined && is_group == 0) {
          console.log(
            "=============== socket have a value=============================="
          );
          var muteUsersSql = `SELECT  
                         GROUP_CONCAT(mufsc.user_id)  AS mute_users  
                   FROM mute_users_for_sigle_chat AS mufsc  
                   WHERE mufsc.is_muted=1 AND
                       (             
                          (mufsc.chat_user_id=${send_by} AND  mufsc.user_id=${sent_to} ) 
                       OR
                          ( mufsc.user_id=${send_by}  AND mufsc.chat_user_id=${sent_to}  ) 
                        )`;

          connection.query(muteUsersSql, async function (err, muteUsersData) {
            // console.log(err,muteUsersData," dddddddddddddddddd ");
            var group_name='';
            if (err) {
              mute_users = "";
              clients[sent_to].emit("receive-message", {
                send_by,
                sent_to,
                newMessage,
                name,
                is_group,
                images,
                createdDatetime,
                profile_picture,
                mute_users,
                is_meta_data,
                group_name
              });
            } else {
              mute_users = muteUsersData[0].mute_users;
              if(mute_users==null){
                mute_users='';
              }
              clients[sent_to].emit("receive-message", {
                send_by,
                sent_to,
                newMessage,
                name,
                is_group,
                images,
                createdDatetime,
                profile_picture,
                mute_users,
                is_meta_data,
                group_name
              });
            }
          });

          // clients[sent_to]
          //   // socket
          //   .emit("receive-message", {
          //     send_by,
          //     sent_to,
          //     newMessage,
          //     name,
          //     is_group,
          //     images,
          //     createdDatetime,
          //     profile_picture,
          //     mute_users,
          //     is_meta_data,
          //   });
        } else if (is_group == 1 || is_group == 2) {
          var group_name="";
          let s3 = await dbScript(db_sql["Q3"], {
            var1: sent_to,
          });
          let forGroupName = await queryAsync(s3);
          group_name = forGroupName[0].name


          console.log("send into group========");

          if (is_group == 1) {
            sql =
              "SELECT users.id,users.divice_token ,GROUP_CONCAT(user_id) AS mute_users FROM users  LEFT JOIN groups_users ON groups_users.user_id=users.id     WHERE  groups_users.group_id=" +
              sent_to +
              " AND users.id<>" +
              send_by +
              " GROUP BY users.id ";
          } else {
            sql =
              "SELECT users.id,users.divice_token  FROM users  LEFT JOIN billing_group_users ON billing_group_users.user_id=users.id     WHERE  billing_group_users.group_id=" +
              sent_to +
              " AND users.id<>" +
              send_by +
              " GROUP BY users.id ";
          }

          // console.log(sql);
          connection.query(sql, async function (err, roomNames) {
            // console.log(err);
            // console.log("uid for ",uid,clients[uid.uid])
            var array1 = [];
            roomNames.forEach((roomName) => {
              if (
                clients[roomName.id] == undefined ||
                clients[roomName.id] == "undefined"
              ) {
                console.log(
                  roomName.id,
                  clients[roomName.id],
                  "dddddddd",
                  roomName.divice_token
                );
                array1.push(roomName.divice_token);
              }
            });
            if (array1.length > 0) {
              // console.log("array1 for push notification ===", array1);
              await pushNotification2(array1, {
                send_by: send_by + "",
                sent_to: sent_to + "",
                newMessage: newMessage + "",
                name: name + "",
                is_group: is_group + "",
                images: images + "",
                createdDatetime: createdDatetime + "",
                profile_picture: profile_picture + "",
              });
              array1 = [];
            }
          });
          let muteUsersSql ="";
          if (is_group == 1) {
             muteUsersSql =
              "SELECT GROUP_CONCAT(user_id) AS mute_users FROM  groups_users   WHERE groups_users.is_muted=1  AND  groups_users.group_id=" +
              sent_to +
              " ";
          } else{
             muteUsersSql =
            "SELECT GROUP_CONCAT(user_id) AS mute_users FROM  billing_group_users   WHERE billing_group_users.is_muted=1  AND  billing_group_users.group_id=" +
            sent_to +
            " ";

          }
            // console.log(muteUsersSql);

            connection.query(muteUsersSql, async function (err, muteUsersData) {
              if (err) {
                console.log(err,"===  258 ===");
                mute_users = "";
                socket.broadcast.to(`chat-${sent_to}`).emit("receive-message", {
                  send_by,
                  sent_to,
                  newMessage,
                  name,
                  is_group,
                  images,
                  createdDatetime,
                  profile_picture,
                  mute_users,
                  is_meta_data,
                  group_name
                });
              } else {
                mute_users = muteUsersData[0].mute_users;
                console.log(mute_users," ========muthe dddddd=")
                 if(mute_users==null){
                mute_users='';
              }
              console.log(" ======================= 277    277")
                socket.broadcast.to(`chat-${sent_to}`).emit("receive-message", {
                  send_by,
                  sent_to,
                  newMessage,
                  name,
                  is_group,
                  images,
                  createdDatetime,
                  profile_picture,
                  mute_users,
                  is_meta_data,
                  group_name
                });
              }
            });
          
          // io.to(room).emit('notification', { message: 'New notification!' });
        } else {
          var sql =
            "SELECT users.id,users.divice_token  FROM users WHERE users.id=" +
            sent_to +
            " ";
          console.log("for sigle chat===", sql);
          connection.query(sql, async function (err, users) {
            var array1 = [];

            if (
              users.length > 0 &&
              users[0].divice_token != null &&
              users[0].divice_token != "null" &&
              users[0].divice_token != "undefined"
            ) {
              array1.push(users[0].divice_token);

              await pushNotification2(array1, {
                send_by: send_by + "",
                sent_to: sent_to + "",
                newMessage: newMessage + "",
                name: name + "",
                is_group: is_group + "",
                images: images + "",
                createdDatetime: createdDatetime + "",
                profile_picture: profile_picture + "",
              });
            }
            array1 = [];
          });
        }
      }
    );

    socket.on("user-typing-message", ({ cid, uid, isTyping, name }) => {
      // connection.query("SELECT * FROM users WHERE id=3 ", function (err,result){
      console.log("user-typing-message", cid, uid, isTyping, name, result);
      var ram = "Shree";
      socket
        .to(`chat-${cid}`)
        .emit("user-typing", { cid, uid, isTyping, name, ram });

      // })
    });

    socket.on("new-conversation", ({ conversation, createId }) => {
      console.log("a client create a new conversation");
      const otherId =
        conversation.firstId === createId
          ? conversation.secondId
          : conversation.firstId;
      socket.broadcast.emit("add-new-conversation", {
        conversation: conversation,
        receiveId: otherId,
      });
    });
  });
};

 
