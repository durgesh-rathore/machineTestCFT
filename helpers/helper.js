var multer = require("multer");
const path = require("path");
const fs = require("fs");
var connection = require("../config/db");
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: "vastram823@gmail.com",
    pass: "zydrbnnikwjzwkgt",
  },
});
async function sendMail(data) {
  try {
    var option = {
      from: "vastram823@gmail.com",
      to: data.email,
      subject: "Reset you password",
      html: "<h1>Your  dummy password is :</h2>"+data.password,
    };
       var info = await transporter.sendMail(option);

     } catch (err) {
      console.log("err===",err);
     }
}




async function save(tbl,data) {
    
    var sql = 'INSERT INTO '+tbl+' SET ?';
    console.log("ddddddddddd==========",data);
    return new Promise((resolve, reject)=> {
      connection.query(sql,data, function(err,data1){
            if(err) {
              console.log(err)
              return reject(err);
            }
            
            resolve(data1.insertId);
            
        });
    })   
  }
  
  
  async function findByIdAndUpdate(tbl,data,con) {
    
    var sql = 'UPDATE '+tbl+' SET  ? WHERE  '+con;
    return new Promise((resolve, reject)=> {
      connection.query(sql,data, function(err,data){
           if(err) {
                console.log(err,"")
              return reject(err);
            }
            
            resolve(data);
            
        });
    })   
  }
  
  
  async function findOne(tbl,con) {
    var sql = 'SELECT * FROM '+tbl+'  WHERE ? '
    return new Promise((resolve, reject)=> {
      connection.query(sql,con, function(err,data){
            if(err) {
              return reject(err);
            }
            if(data.length > 0) {
            resolve(data[0]);
            }else{
              resolve("");
            }
        });
    })  
  
  }
  module.exports={
  save,
  findOne,
  findByIdAndUpdate,
  sendMail
  }