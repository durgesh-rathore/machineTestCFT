var jwt = require("jsonwebtoken");
var connection = require("../config/db");
var constants = require("../config/constants");
var { encryptPassword, checkPassword } = require("../config/custom");
// var helper = require('../../Helpers/helper');
var multer = require("multer");
const path = require("path");
const fs = require("fs");


exports.add = function (req, res) {

    console.log("===========",req.body);
      try {
    
        groupData={
            group_admin_id:req.body.group_admin_id,
            type:req.body.type,
            name:req.body.name
            
        }
            
        connection.query(
    
            "INSERT INTO groups SET ?",
            groupData,
            async function (err, group) {
              if (err) console.log(err)
              if (posts) {
            console.log(req.body.group_members,"group_members ");
                var group_members=[1,2,3,4];
                var array=[];
                var  group_users={}
                group.group_id=group.insertId
                group_members.forEach(element => {
                  group_users.user_id=element
               
                  array.push(group_users);
                });
                console.log("group_user======",group_users);         
                  return res.json({
                  success: true,
                  response: {group_id:group.insertId},
                  message: "Group created successful.",
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