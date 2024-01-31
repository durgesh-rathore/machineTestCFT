var connection = require("./config/db");
var { save } = require("./helpers/helper");

var clients = [];

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("disconnect", (_) => {
      const userId = Object.keys(clients).find(
        (key) => clients[key] === socket
      );
      if (userId) {
        delete clients[userId];
      }
      socket.disconnect();
    });

    socket.on("user-login", (uid) => {
      clients[uid.uid] = socket;
    });

    
    socket.on("user-join-room", ({ roomId }) => {
      if (!isUserInRoom(roomId)) {
        socket.join(`chat-${roomId}`);
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

    function isUserInRoom(roomId) {
      const rooms = Object.keys(socket.rooms);
      return rooms.includes(`chat-${roomId}`);
    }

    socket.on("user-send-message", async ({ send_by, newMessage, sent_to }) => {
      var data = {
        message: newMessage,
        send_by: send_by,
        sent_to: sent_to,
      };

      await save("chats", data);

      if (clients[sent_to] != undefined ) {
        mute_users = "";
        clients[sent_to].emit("receive-message", {
          send_by,
          sent_to,
          newMessage,
        });
      }
    });

    socket.on("broadcast_message", async ({ send_by, newMessage }) => {
      var data = {
        message: newMessage,
        send_by: send_by,
         };

      await save("chats", data);

      if (clients[sent_to] != undefined ) {
        mute_users = "";
        socket.broadcast.to(`chat-${sent_to}`).emit("receive-message", {
          send_by,
          sent_to,
          newMessage,
        });
      }
    });



    socket.on("user-typing-message", ({ cid, uid, isTyping, name }) => {
      console.log("user-typing-message", cid, uid, isTyping, name, result);
      socket
        .to(`chat-${cid}`)
        .emit("user-typing", { cid, uid, isTyping, name, ram });
    });
  });
};
