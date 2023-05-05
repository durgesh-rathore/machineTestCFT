var jwt = require("jsonwebtoken");
var connection = require("../config/db");
var constants = require("../config/constants");
var { encryptPassword, checkPassword } = require("../config/custom");
// var helper = require('../../Helpers/helper');
var multer = require("multer");
const path = require("path");
const fs = require("fs");


exports.exploreList = function (req, res) {
    
    
    if(req.query.login_user_id){
        var page=req.query.page?req.query.page:0;
        var sql="SELECT users.profile_picture,users.name,users.id, (SELECT  COUNT(users_requests.request_for) FROM users_requests WHERE users_requests.is_follow!=0  AND users_requests.request_for=users.id ) AS followed_by FROM users LEFT JOIN users_requests ON users_requests.request_for=users.id WHERE users.id !='"+req.query.login_user_id+"'  AND users_requests.user_id IS NULL  GROUP BY users.id limit  "+(page*10)+", 10"

        var sql="SELECT users.profile_picture,users.name,users.id, (SELECT  COUNT(users_requests.request_for) FROM users_requests WHERE users_requests.is_follow!=0 AND users_requests.request_for=users.id ) AS followed_by FROM users LEFT JOIN users_requests ON users_requests.request_for=users.id WHERE users.id !='"+req.query.login_user_id+"' AND ( users_requests.user_id!='"+req.query.login_user_id+"' OR  users_requests.user_id IS NULL)  GROUP BY users.id  limit  "+(page*10)+", 10"

        console.log("sql explorelist",sql);
  connection.query(
    sql,    
    async function (err, users) {
      if (users.length > 0) {
        var sqlCount="SELECT  COUNT(users.id) AS total_count FROM users LEFT JOIN users_requests ON users_requests.request_for=users.id WHERE users.id !='"+req.query.login_user_id+"' AND ( users_requests.user_id!='"+req.query.login_user_id+"' OR  users_requests.user_id IS NULL)  "
        console.log(sqlCount);
        connection.query(
          sqlCount,    
          async function (err, usersCount) {   
            if(err){
              console.log("====",err);
            }else{
              var count=usersCount[0].total_count
           
        return res.json({
            response:users,
            total:count,
          success: true,
          message: "user list",
        });
      }

    })
      } else {
        return res.json({
            response:[],
            success: false,
            message: "Not any users.",
          });
      }
    }
  );
}
else{
    return res.json({
        response:[],
        success: false,
        message: "Not valid user",
      });
}
};

exports.followUser=function(req,res){
    if(req.body.login_user_id && req.body.request_for){
      connection.query("SELECT * FROM users_requests WHERE  user_id="+req.body.login_user_id+" AND request_for="+req.body.request_for,function(err,usersRequest){
if(usersRequest.length>0){
  return res.json({
    success: true,
    message: "Already followed.",
  });
}else{

  var users_request={
    user_id:req.body.login_user_id,
     request_for:req.body.request_for,
     is_follow:1
  }
  connection.query(
    "INSERT INTO users_requests SET ?",
    users_request,
    async function (err, result) {
      if (err) throw err;
      if (result) {
        return res.json({
          success: true,
          
          message: "Follow .",
        });
      } else {
        return res.json({
          success: false,
          message: "Something went wrong.",
        });
      }
    }
  );

}

      })
       
    }
}
exports.unFollowUser=function(req,res){
  if(req.body.login_user_id && req.body.request_for){
           connection.query(
        " UPDATE users_requests SET is_follow=0  WHERE user_id="+req.body.login_user_id+" AND request_for="+req.body.request_for,
        
        async function (err, result) {
          if (err) throw err;
          if (result) {
            return res.json({
              success: true,
              response: result.insertId,
              message: "Unfollow .",
            });
          } else {
            return res.json({
              success: false,
              message: "Something went wrong.",
            });
          }
        }
      );

  }
}
exports.rejectUser=function(req,res){
  if(req.body.login_user_id && req.body.request_for){
    connection.query("SELECT * FROM users_requests WHERE  user_id="+req.body.login_user_id+" AND request_for="+req.body.request_for,function(err,usersRequest){
      if(usersRequest.length>0){
        connection.query(
          " UPDATE users_requests SET is_reject=1  WHERE user_id="+req.body.login_user_id+" AND request_for="+req.body.request_for,
            async function (err, result) {
            if (err) throw err;
            if (result) {
              return res.json({
                success: true,
                message: "Rejected .",
              });
            } else {
              return res.json({
                success: false,
                message: "Something went wrong.",
              });
            }
          }
        );

      }else{
        var users_request={
          user_id:req.body.login_user_id,
           request_for:req.body.request_for,
           is_reject:1
        }
    
        connection.query(
          "INSERT INTO users_requests SET ?",
          users_request,
          async function (err, result) {
            if (err) throw err;
            if (result) {
              return res.json({
                success: true,
                
                message: "Rejected .",
              });
            }
          })
      }

    })


    


        

  }
}
exports.blockUser=function(req,res){
  if(req.body.login_user_id && req.body.request_for){
           connection.query(
        " UPDATE users_requests SET is_follow=0  WHERE user_id="+req.body.login_user_id+" AND request_for="+req.body.request_for,
        
        async function (err, result) {
          if (err) throw err;
          if (result) {
            return res.json({
              success: true,
              response: result.insertId,
              message: "Unfollow .",
            });
          } else {
            return res.json({
              success: false,
              message: "Something went wrong.",
            });
          }
        }
      );

  }
}
exports.unBlockUser=function(req,res){
  if(req.body.login_user_id && req.body.request_for){
           connection.query(
        " UPDATE users_requests SET is_follow=0  WHERE user_id="+req.body.login_user_id+" AND request_for="+req.body.request_for,
        
        async function (err, result) {
          if (err) throw err;
          if (result) {
            return res.json({
              success: true,
              response: result.insertId,
              message: "Unfollow .",
            });
          } else {
            return res.json({
              success: false,
              message: "Something went wrong.",
            });
          }
        }
      );

  }
}
exports.acceptRequest=function(req,res){
  if(req.body.login_user_id && req.body.request_for){
               connection.query(
        " UPDATE users_requests SET is_accepted=1  WHERE user_id="+req.body.request_for+" AND request_for="+req.body.login_user_id,
        
        async function (err, result) {
          if (err) throw err;
          if (result) {
            return res.json({
              success: true,
              
              message: "Accepted .",
            });
          } else {
            return res.json({
              success: false,
              message: "Something went wrong.",
            });
          }
        }
      );

  }
}




exports.requestsList = function (req, res) {
    
    
  if(req.query.login_user_id){
      var page=req.query.page?req.query.page:0;
      var sql="SELECT users.profile_picture,users.name,users.id, (SELECT  COUNT(users_requests.request_for) FROM users_requests WHERE users_requests.is_follow!=0  AND users_requests.request_for=users.id ) AS followed_by  FROM users_requests LEFT JOIN users ON users.id=users_requests.user_id WHERE users_requests.request_for='"+req.query.login_user_id+"' AND users_requests.is_follow=1 AND users_requests.is_reject!=1 AND users_requests.is_block!=1 AND users_requests.is_accepted!=1 limit  "+(page*10)+", 10"

      

      console.log("sql requestsList",sql);
connection.query(
  sql,    
  async function (err, users) {
    if (users.length > 0) {
      var sqlCount="SELECT COUNT(users_requests.user_id) AS total_count FROM users_requests LEFT JOIN users ON users.id=users_requests.user_id WHERE users_requests.request_for='"+req.query.login_user_id+"' AND users_requests.is_follow=1 AND users_requests.is_reject!=1 AND users_requests.is_block!=1 AND users_requests.is_accepted!=1"
        console.log(sqlCount);
      connection.query(
        sqlCount,    
        async function (err, usersCount) {   
          if(err){
            console.log("====",err);
          }else{
            var count=usersCount[0].total_count
         
      return res.json({
          response:users,
          total:count,
        success: true,
        message: " request users list",
      });
    }

  })
    } else {
      return res.json({
          response:[],
          success: false,
          message: "Not any users.",
        });
    }
  }
);
}
else{
  return res.json({
      response:[],
      success: false,
      message: "Not valid user",
    });
}
};
exports.allFriendsList = function (req, res) {
    
    
  if(req.query.login_user_id){
      var page=req.query.page?req.query.page:0;
      var sql="SELECT users.profile_picture,users.name,users.id, (SELECT  COUNT(users_requests.request_for) FROM users_requests WHERE users_requests.is_follow!=0  AND users_requests.request_for=users.id ) AS followed_by  FROM users_requests LEFT JOIN users ON users.id=users_requests.user_id WHERE users_requests.request_for='"+req.query.login_user_id+"' AND users_requests.is_follow=1 AND users_requests.is_reject!=1 AND users_requests.is_block!=1 AND users_requests.is_accepted=1 limit  "+(page*10)+", 10"

      

      console.log("sql requestsList",sql);
connection.query(
  sql,    
  async function (err, users) {
    if (users.length > 0) {
      var sqlCount="SELECT COUNT(users_requests.user_id) AS total_count FROM users_requests LEFT JOIN users ON users.id=users_requests.user_id WHERE users_requests.request_for='"+req.query.login_user_id+"' AND users_requests.is_follow=1 AND users_requests.is_reject!=1 AND users_requests.is_block!=1 AND users_requests.is_accepted=1"
        console.log(sqlCount);
      connection.query(
        sqlCount,    
        async function (err, usersCount) {   
          if(err){
            console.log("====",err);
          }else{
            var count=usersCount[0].total_count
         
      return res.json({
          response:users,
          total:count,
        success: true,
        message: " Friends list",
      });
    }

  })
    } else {
      return res.json({
          response:[],
          success: false,
          message: "No any friend.",
        });
    }
  }
);
}
else{
  return res.json({
      response:[],
      success: false,
      message: "Not valid user",
    });
}
};