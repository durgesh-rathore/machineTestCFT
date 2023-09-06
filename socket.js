var connection = require("./config/db");
var { save, findByIdAndUpdate,pushNotification2} = require("./helpers/helper");
var clients=[];
module.exports = io => {
  io.on('connection', socket => {
    console.log('User has connect55');
    socket.on('disconnect', _ => {

      const userId = Object.keys(clients).find((key) => clients[key] === socket);
  if (userId) {
    console.log("when disconted to the user from === ",userId)
    delete clients[userId];
  }

      console.log('User disconnected');

      // socket.emit('user-disconnect');
      socket.disconnect();
    });

    socket.on('user-login', uid => {
      console.log('user-login : ', uid);
      clients[uid.uid]=socket
      sql =
      "SELECT users.id  FROM users  LEFT JOIN groups_users ON groups_users.group_id=users.id     WHERE users.is_group<>0 AND groups_users.user_id=" +
      uid.uid +     
      " GROUP BY users.id ";
    console.log(sql);
    connection.query(sql, function (err, roomNames) {
      console.log(err);
      // console.log("uid for ",uid,clients[uid.uid])
      roomNames.forEach((roomName) => {
        console.log(" join room when login_event fire ===",roomName);
        socket.join(`chat-${roomName.id}`);
      });

      

    });
  })

    socket.on('user-setOffline', uid => {
      console.log('user-offline : ', uid);

    });

    socket.on('user-join-room', ({ roomId }) => {
      // console.log(`A user joined chat-${roomId}`);
      socket.join(`chat-${roomId}`);
    });
    // {'send_by': userId,'sent_to' :'2', 'newMessage': message, 'name': login_userName,'group_id':''    ,'image': ''};
    socket.on('user-send-message', async ({ send_by, sent_to,newMessage,name,is_group,images,createdDatetime,profile_picture }) => {


      if(images=='' || images==null || images==undefined || newMessage!='' && send_by!=sent_to  ){

        var data={
          message:newMessage,
          send_by:send_by,
          sent_to:sent_to,
          is_group:is_group,
          }
     await save("chats",data)
    }
      console.log("{ conversation, newMessage }========", send_by, sent_to,newMessage,name,is_group,images,createdDatetime,profile_picture);
      // socket
        // .to(`chat-${conversation._id}`)
      // console.log("============client==",clients)
      console.log("============client1111111111111111==",clients[sent_to]);

if(clients[sent_to]!=undefined && is_group==0){
       clients[sent_to]
  // socket
  .emit('receive-message', { send_by, sent_to,newMessage,name,is_group,images,createdDatetime ,profile_picture});
}else if(is_group==1 || is_group==2){
  console.log("send into group========")

  sql =
  "SELECT users.id,users.divice_token  FROM users  LEFT JOIN groups_users ON groups_users.user_id=users.id     WHERE  groups_users.group_id=" +
  sent_to +     
  " AND users.id<>"+ send_by +" GROUP BY users.id ";
console.log(sql);
connection.query(sql, async function (err, roomNames) {
  console.log(err);
  // console.log("uid for ",uid,clients[uid.uid])
  var array1=[]
  roomNames.forEach((roomName) => {
    if(clients[roomName.id]==undefined || clients[roomName.id]=='undefined' ){
      console.log(roomName.id,clients[roomName.id],"dddddddd",roomName.divice_token);
      array1.push(roomName.divice_token);
    }
  });
if(array1.length>0){
  console.log("array1 for push notification ===",array1);
  await pushNotification2(array1,{ send_by:send_by+"", sent_to:sent_to+"",newMessage:newMessage+"",name:name+"",is_group:is_group+"",images:images+"",createdDatetime:createdDatetime+"" ,profile_picture:profile_picture+""});
  array1=[];
}

});

socket.broadcast.to(`chat-${sent_to}`).emit('receive-message', { send_by, sent_to,newMessage,name,is_group,images,createdDatetime ,profile_picture});
// io.to(room).emit('notification', { message: 'New notification!' });

}else{

 var sql =
  "SELECT users.id,users.divice_token  FROM users WHERE users.id=" +
  sent_to +     
  " ";
console.log("for sigle chat===",sql);
connection.query(sql, async function (err, users) {  
  var array1=[];
  array1.push(users[0].divice_token);
  if(users.length>0 && users.divice_token!=null && users.divice_token!='null' && users.divice_token!='undefined'){

await pushNotification2(array1,{ send_by:send_by+"", sent_to:sent_to+"",newMessage:newMessage+"",name:name+"",is_group:is_group+"",images:images+"",createdDatetime:createdDatetime+"" ,profile_picture:profile_picture+""});

  }
  array1=[];

})

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
