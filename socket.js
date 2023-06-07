var connection = require("./config/db");
var { save, findByIdAndUpdate } = require("./helpers/helper");

module.exports = io => {
  io.on('connection', socket => {
    console.log('User has connect55');
    socket.on('disconnect', _ => {
      console.log('User disconnected');
      socket.emit('user-disconnect');
      socket.disconnect();
    });

    socket.on('user-login', uid => {
      console.log('user-login : ', uid);

// Wirte Query if required
    //   User.findById(uid).exec((err, user) => {
    //     if (user) {
    //       user.isOnline = true;
    //       user.save();
    //     }
    //   });


    });

    socket.on('user-setOffline', uid => {
      console.log('user-offline : ', uid);

      // Wirte Query if required
    //   User.findById(uid).exec((err, user) => {
    //     if (user) {
    //       user.isOnline = false;
    //       user.save();
    //     }
    //   });

    });

    socket.on('user-join-room', ({ roomId }) => {
      console.log(`A user joined chat-${roomId}`);
      socket.join(`chat-${roomId}`);
    });
    // {'send_by': userId,'sent_to' :'2', 'newMessage': message, 'name': login_userName,'group_id':''    ,'image': ''};
    socket.on('user-send-message', ({ send_by, sent_to,newMessage,name,group_id,image }) => {
      
      console.log("{ conversation, newMessage }========", send_by, sent_to,newMessage,name,group_id,image);
      socket
        // .to(`chat-${conversation._id}`)
        .emit('receive-message', { send_by, sent_to,newMessage,name,group_id,image });
    });

    socket.on('user-typing-message', ({ cid, uid, isTyping, name }) => {
      // connection.query("SELECT * FROM users WHERE id=3 ", function (err,result){
      console.log("user-typing-message",cid,uid,isTyping,name,result)
      var ram="Shree";
      socket
        .to(`chat-${cid}`)
        .emit('user-typing', { cid, uid, isTyping, name,ram, });

      // })
    });

    socket.on('new-conversation', ({ conversation, createId }) => {
      console.log('a client create a new conversation');
      const otherId =
        conversation.firstId === createId
          ? conversation.secondId
          : conversation.firstId;
      socket.broadcast.emit('add-new-conversation', {
        conversation: conversation,
        receiveId: otherId
      });
    });
  });
};
