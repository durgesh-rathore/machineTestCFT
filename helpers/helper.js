var multer = require("multer");
const path = require("path");
const fs = require("fs");
var connection = require("../config/db");


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
  findByIdAndUpdate
  }