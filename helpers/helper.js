var multer = require("multer");
const path = require("path");
const fs = require("fs");
var connection = require("../config/db");

var constants = require("../config/constants");
const nodemailer = require("nodemailer");

const gcm = require("node-gcm");

var admin = require("firebase-admin");
const serviceAccount = require("../config/forgetme-note-beta-firebase-adminsdk-jodor-ab73605fd4.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function pushNotification(device_token, message, status) {
  title = "ForgetMeNote";

  var sender = new gcm.Sender(constants.FIREBASE_NOTIFICATION_KEY);
  var message = new gcm.Message({
    data: { title: title, message: message, status: status },
    notification: { title: title, body: message },
  });

  sender.send(
    message,
    { registrationTokens: [device_token] },
    function (err, response) {
      if (err) console.error(err);
      if (response)
        console.log(response, "response======== of push notification ===");
    }
  );
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: "vastram823@gmail.com",
    pass: "zydrbnnikwjzwkgt",
    // user: "nebor.global@gmail.com",
    // pass: "yclngaunzovlucah",
  },
});
async function sendMail(data) {
  console.log("in mail");
  try {
    var option = {
      from: "vastram823@gmail.com",
      // from: "nebor.global@gmail.com",
      to: data.email,
      subject: "Reset you password",
      html: "<h1>Your  dummy password is :</h2>" + data.password,
    };
    var info = await transporter.sendMail(option);
  } catch (err) {
    console.log("err===", err);
  }
}
// sendMail({email:"durgeshrathore060@gmail.com"});

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

async function findByIdAndUpdate(tbl, data, con) {
  var sql = "UPDATE " + tbl + " SET  ? WHERE  " + con;
  return new Promise((resolve, reject) => {
    connection.query(sql, data, function (err, data) {
      if (err) {
        console.log(err, "");
        return reject(err);
      }

      resolve(data);
    });
  });
}

async function findOne(tbl, con) {
  var sql = "SELECT * FROM " + tbl + "  WHERE ? ";
  return new Promise((resolve, reject) => {
    connection.query(sql, con, function (err, data) {
      if (err) {
        return reject(err);
      }
      if (data.length > 0) {
        resolve(data[0]);
      } else {
        resolve("");
      }
    });
  });
}


async function pushNotification1(
  device_token,
  message,
  status,
  post_id,
  post_type
) {
  const registrationTokens = device_token;

  const notificationPayload = {
    notification: {
      title: "ForgetMeNote",
      body: message,
    },
    // Add any additional data you want to send
    data: {
      status: status,
      post_id: post_id,
      post_type: post_type,
      // ...
    },
  };

  // Send multicast message
  admin
    .messaging()
    .sendMulticast({
      tokens: registrationTokens,
      notification: notificationPayload.notification,
      data: notificationPayload.data,
    })
    .then((response) => {
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
}


async function addWatermarkToImage(imageBuffer, watermarkText) {
  const sharp = require("sharp");
  const { createCanvas, loadImage, registerFont } = require("canvas");

  // Load your custom font (optional, for watermark text)
  // registerFont('path/to/your/font.ttf', { family: 'CustomFont' });
  // Create a canvas with the same dimensions as the image
  const image = await sharp(imageBuffer);
  const metadata = await image.metadata();
  const canvas = createCanvas(metadata.width, metadata.height);
  const ctx = canvas.getContext("2d");
  const textSize = ctx.measureText(watermarkText);
  const textX = metadata.width - textSize.width - 160; // Center horizontally
  const textY = metadata.height - 20;
  // Load the image onto the canvas
  const img = await loadImage(imageBuffer);
  console.log(img, "image===");
  ctx.drawImage(img, 0, 0, metadata.width, metadata.height);

  // Add watermark text
  // ctx.font = '30px CustomFont'; // Use your custom font here
  ctx.font = '30px "Open Sans", sans-serif';

  // ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
  // Watermark text color and opacity
  ctx.fillText(watermarkText, textX, textY); // Adjust the position of the watermark

  // Convert the canvas to a Buffer
  return canvas.toBuffer("image/jpeg");
}


module.exports = {
  save,
  findOne,
  findByIdAndUpdate,
  sendMail,
  pushNotification,
  pushNotification1,
  addWatermarkToImage,
};
