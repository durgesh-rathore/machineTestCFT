var multer = require("multer");
const path = require("path");
const fs = require("fs");
var connection = require("../config/db");


var constants = require("../config/constants");











async function save(tbl, data) {
  var sql = "INSERT INTO " + tbl + " SET ?";
  console.log("ddddddddddd==========", data);
  return new Promise((resolve, reject) => {
    connection.query(sql, data, function (err, data1) {
      if (err) {
        console.log(err);
        return reject(err);
      }

      resolve(data1.insertId);
    });
  });
}












module.exports = {
  save,
  
  
  };
