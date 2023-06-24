var connection = require("./config/db");
var { save, findByIdAndUpdate } = require("./helpers/helper");
var clients=[];
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
      clients[uid.uid]=socket
      console.log("uid for ",uid,clients[uid.uid])

    });

    socket.on('user-setOffline', uid => {
      console.log('user-offline : ', uid);

    });

    socket.on('user-join-room', ({ roomId }) => {
      console.log(`A user joined chat-${roomId}`);
      socket.join(`chat-${roomId}`);
    });
    // {'send_by': userId,'sent_to' :'2', 'newMessage': message, 'name': login_userName,'group_id':''    ,'image': ''};
    socket.on('user-send-message', async ({ send_by, sent_to,newMessage,name,is_group,image,createdDatetime,profile_picture }) => {


      if(image=='' || image==null || image==undefined || newMessage!='' && send_by!=sent_to  ){

        var data={
          message:newMessage,
          send_by:send_by,
          sent_to:sent_to,
          is_group:is_group,
          }
     await save("chats",data)
    }
      console.log("{ conversation, newMessage }========", send_by, sent_to,newMessage,name,is_group,image,createdDatetime,profile_picture);
      // socket
        // .to(`chat-${conversation._id}`)
      // console.log("============client==",clients)
      console.log("============client1111111111111111==",clients[sent_to]);

if(clients[sent_to]!=undefined && is_group==0){
       clients[sent_to]
  // socket
  .emit('receive-message', { send_by, sent_to,newMessage,name,is_group,image,createdDatetime ,profile_picture});
}else if(is_group==1){
  console.log("send into group========")
socket.broadcast.to(`chat-${sent_to}`).emit('receive-message', { send_by, sent_to,newMessage,name,is_group,image,createdDatetime ,profile_picture});
// io.to(room).emit('notification', { message: 'New notification!' });

}
    })    ;

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
