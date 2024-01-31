
var connection = require('./db.js');
var jwt = require('jsonwebtoken');
exports.userStatus = (req, res, next) => {  
    try {
        if(!req.headers.authorization)
            return res.status(400).json({status:"false",message:"Unauthorized"})
            else
        if(req.headers.authorization == null)
            return res.status(400).send({status:"false",message:"Invalid User"});

         token = req.headers.authorization;

         payload = jwt.verify(token.split(" ")[1],"seecret_key");
         var user_id = payload.id;
         connection.query('SELECT * FROM users WHERE id = ?',user_id, function(err, users) {
        if (err) throw err;
          if (err) {
              return done(err, false);
          }
          if (users.length == 1) {
            //  if(users[0].is_active == 0){
            //   res.status(401).send({status:false,message:"Unauthorized"});
            // }
            // else if(users[0].is_deleted == 1){
            //   res.status(401).send({status:false,message:"Unauthorized"});
            // }else {
            //       next();
            // }
            next();
          } else {
            console.log("ddd 11")
            res.status(401).send({status:false,message:"Unauthorized"});
             
          }
      });
      
    }
    catch(err) {
      res.status(401).send({status:false,message:"Unauthorized"});
    }
}