const multer = require("multer")
const path = require("path")
const bcrypt = require("bcrypt")
// const dotenv = require("dotenv")
const jwt = require("jsonwebtoken")

function token(postData) {
    return jwt.sign(
      {
        email: postData.email,
        password: postData.password,
      },
      process.env.SECERATE
    );
  }




function encryptPassword(password) {
    return new Promise(async (resolve, reject) => {
      bcrypt.hash(password, 10, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
}



async function checkPassword(password, hashPassword) {
    return new Promise(async (resolve, reject) => {
      bcrypt.compare(
        password.toString(),
        hashPassword.toString(),
        (err, data) => {
          if (err) reject(err);
          resolve(data);
        }
      );
    });
}
  module.exports={
    encryptPassword,
    checkPassword,
    token,
   
     }