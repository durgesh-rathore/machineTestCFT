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
function uploadFiles(folder) {
    const Storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null,folder);
      },
  
      filename: (req, file, cb) => {
        const fileNameCheck = file.originalname.replace(
          /[-&\/\\#.,+()$~%'":*?<>{} ]/g,
          ""
        );
        cb(
          null,
          `${fileNameCheck}-${Date.now()}${path.extname(file.originalname)}`
        );
      },
    });
    return multer({ storage: Storage });
}



function encryptPassword(password) {
    return new Promise(async (resolve, reject) => {
      bcrypt.hash(password, 10, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
}

function removeImage(image){

    let imagepath = path.join(__dirname,"..",`${image}`)
    if (fs.existsSync(imagepath)) {
      fs.unlinkSync(imagepath, err => {
        if (err) {
          console.log(err)
        }
      })
    }
  }

function dirName(dir){
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true
      });
    }
  }

function commonResponse(res,code, message, data) {
    return res.send({
      code: code,
      status: false,
      message: message,
      data: data,
    });
}
function successResponse(res,code, message, data) {
    return res.send({
      code: code,
      status: true,
      message: message,
      data: data,
    });
}

function errResponse(res) {
    return res.send({
      code: 500,
      status: false,
      message: "Internal Server Error.",
      data: {},
    });
}

function randomNumberGenerate(length) {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
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

// async function statusChange(){
// const IN_DEVELOPMENT = false;

// const DEV_PATH = path.join(__dirname,"..", "config/environment/dev.env");
// const PROD_PATH = path.join(__dirname,"..", "/config/environment/prod.env");

// if (IN_DEVELOPMENT) {
//   dotenv.config({ path: DEV_PATH });
// } 
// else {
//   dotenv.config({ path: PROD_PATH });
// }
// return process.env

// }










  module.exports={
    uploadFiles,
    errResponse,
    commonResponse,
    successResponse,
    randomNumberGenerate,
    encryptPassword,
    checkPassword,
    token,
   
    // statusChange
  }