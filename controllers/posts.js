var jwt = require("jsonwebtoken");
var connection = require("../config/db");
var constants = require("../config/constants");

var {save} = require('../helpers/helper');
var multer = require("multer");
const path = require("path");
const fs = require("fs");

exports.new = function (req, res) {


    

  try {

    userPost={
        user_id:req.body.login_user_id,
        description:req.body.description,
        is_visible_all:req.body.is_visible_all?req.body.is_visible_all:0,
        
    }
    if( req.file && req.file.filename!='' && req.file.filename!=undefined){
        userPost.image=req.file.filename
// console.log("jay shree ram");
    }
    

    connection.query(

        "INSERT INTO posts SET ?",
        userPost,
        async function (err, posts) {
          if (err) console.log(err)
          if (posts) {
            return res.json({
              success: true,
              response: {post_id:posts.insertId},
              message: "Post created successful.",
            });
          } else {
            return res.json({
              success: false,
              message: "Something went wrong.",
            });
          }
        }
      );
  } catch (error) {
    console.error(error);
  }
};

exports.visibility = function (req, res) {

    console.log("===========",req.body);
        try {
        visibility_data={};
        if(req.body.post_id){
            visibility_data.post_id=req.body.post_id
        }
        if(req.body.user_id){
            visibility_data.user_id=req.body.user_id
        }
        if(req.body.group_id){
            visibility_data.group_id=req.body.group_id
        }
        if(req.body.event_id){
            visibility_data.event_id=req.body.event_id
        }
          visibility_data.not_visible=req.body.not_visible?req.body.not_visible:0,    
        connection.query(
            "INSERT INTO visibility SET ?",
            visibility_data,
            async function (err, visibility_data) {
              if (err) console.log(err)
              if (visibility_data) {
                return res.json({
                  success: true,
                   message: "visibility applied successful.",
                });
              } else {
                return res.json({
                  success: false,
                  message: "Something went wrong.",
                });
              }
            }
          );
      } catch (error) {
        console.error(error);
      }
    };

exports.getPostsList = function (req, res) {
    var page = req.query.page ? req.query.page : 0;
    sql="SELECT posts.description,CONCAT('" + constants.BASE_URL + "','images/postImage/',posts.image) AS post_image,TIMESTAMPDIFF(MINUTE, posts.updated_datetime , CURRENT_TIMESTAMP) AS create_minute_ago,users.name,CONCAT('" +   constants.BASE_URL + "','images/profiles/',users.profile_picture) AS profile_picture FROM  posts LEFT JOIN users ON users.id=posts.user_id WHERE posts.is_visible_all=1 Limit " + page + ",8"
    console.log("===",sql);
    connection.query(sql
      ,
      function (err, post_list) {
        console.log(err,post_list);
        if (post_list.length > 0) {

          var sqlCounts="SELECT COUNT(*) AS post_count FROM  posts LEFT JOIN users ON users.id=posts.user_id WHERE posts.is_visible_all=1"
          connection.query(sqlCounts
            ,
            function (err, counts) {
              if(err){
              console.log(err)
            }

                    return res.json({
                response:post_list,
                totalPost:counts[0].post_count,
                success: true,
                message: "Posts list",
              });
            })
        } else{


          return res.json({
            response:[],
            totalPost:0,
            success: false,
            message: "No More Posts",
          });
        }
      }
    );
  };

exports.saveComment=async function(req,res){
  var data={}

  if(req.body.comment_by && req.body.comment && req.body.post_id ){
    data.comment_by=req.body.comment_by
    data.comment=req.body.comment
    data.post_id=req.body.post_id


  var c=await helper.save("comments",data);
  console.log("c====",c)
  if(c){
  return res.json({success:true,message:c})
}else{
  return res.json({success:false,message:c})
}
  }
}
  exports.getCommentListOnPosts = function (req, res) {
    var page = req.query.page ? req.query.page : 0;
    sql="SELECT users.name,comments.comment , users.profile_picture FROM comments LEFT JOIN users ON users.id=comments.comment_by WHERE comments.post_id="+req.query.post_id+" Limit " + page + ",8"
    
    connection.query(sql
      ,
      function (err, comments_list) {
        console.log(err);
        if (comments_list.length > 0) {
          var sqlCounts="SELECT count(*) AS likes_count FROM comments LEFT JOIN users ON users.id=comments.comment_by WHERE comments.post_id="+req.query.post_id+""
          connection.query(sqlCounts
            ,
            function (err, total_comment) {
              if(err){
              console.log(err)
            }

            return res.json({
                response:comments_list,
                total_comment:total_comment[0].comment_count,
                success: true,
                message: "Comments list .",
              });
            })
        }
      }
    );
  };

  exports.saveEvent=async function(req,res){
    var data={}
  
    if(req.body.login_user_id && req.body.title && req.body.type ){
      data.user_id=req.body.login_user_id
      data.title=req.body.title;
      data.type=req.body.type;

      data.start_date=req.body.start_date;
      data.end_date=req.body.end_date;
      data.start_time=req.body.start_time;
      data.end_time=req.body.end_time;
  
    var c=await save("events",data);
    console.log("c====",c)
    if(c){
    return res.json({success:true,message:"event saved.",response:c});
  }else{
    return res.json({success:false,message:"something went wrong"});
  }
    }
  }

  exports.postEvent=async function(req,res){

    var data={}
    if(req.file){
    data.image=req.file.filename;
  }
    venue=req.body.venue;
    description=req.body.description;
    if(req.body.is_visible_all==1){
     data.is_visible_all=req.body.is_visible_all;
     data.post_datetime=new Date();
    }else{
      data.is_visible_all=req.body.is_visible_all?req.body.is_visible_all:0;
    }
     
    var con=" 1 "
    con = "  id = "+req.body.event_id+ " "
  
  
    var c=await helper.findByIdAndUpdate("events",data,con);
    console.log("c====",c)
    if(c){
    return res.json({success:true,message:c})
  }else{
    return res.json({success:false,message:c})
  }
    
  }

  exports.liked=async function(req,res){
    var data={}
  
    if(req.body.liked_by &&  req.body.post_id ){
      data.liked_by=req.body.liked_by
      data.post_id=req.body.post_id
      sql="SELECT * FROM likes  WHERE likes.post_id="+req.body.post_id+"  AND likes.liked_by="+req.body.liked_by+""
    
      connection.query(sql,async function (err, likes_list) {

          console.log(err);

  if(likes_list.length==0){
    var c=await helper.save("likes",data);
    console.log("c====",c)
    if(c){
    return res.json({success:true,message:"liked"})
  }else{
    return res.json({success:false,message:c})
  }
}else{
  var con="likes.post_id="+req.body.post_id+"  AND likes.liked_by="+req.body.liked_by;
  var data={
    is_likes:0
  }
  helper.findByIdAndUpdate("likes",data,con)
  return res.json({success:true,message:" Disliked"})
}
})
    }
  }
  exports.getLikedListOnPosts = function (req, res) {
    var page = req.query.page ? req.query.page : 0;
    sql="SELECT users.name,users.profile_picture FROM likes LEFT JOIN users ON users.id=likes.liked_by WHERE likes.post_id="+req.query.post_id+" Limit " + page + ",8"
    
    connection.query(sql,function (err, likes_list) {
        console.log(err);
        var sqlCounts="SELECT count(*) AS likes_count FROM likes LEFT JOIN users ON users.id=likes.liked_by WHERE likes.post_id="+req.query.post_id+""
        connection.query(sqlCounts
          ,
          function (err, likes_count) {
            if(err){
            console.log(err)
          }
        if (likes_list.length > 0) {
        

            return res.json({
                response:likes_list,
                total_comment:likes_count[0].likes_count,
                success: true,
                message: "likes list .",
              });
            }else{
              return res.json({
                response:likes_list,
                total_comment:likes_count[0].likes_count,
                success: true,
                message: "likes list .",
              });
            }
            })
            })
        
         
  };