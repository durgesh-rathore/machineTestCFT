var multer = require("multer");
const path = require("path");
const fs = require("fs");
var connection = require("../config/db");
const io=require("../socket");
const clients=require("../socket");

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
  // port: 587,
  port: 993,
  secure: false,
  requireTLS: true,
  auth: {
    user: "vastram823@gmail.com",
    pass: "zydrbnnikwjzwkgt",
    // user: "webdev@laughmd.app",
    // pass: "EYn0EfmJ6LfdV*wz*4swP6q)",
  },
});
async function sendMail(data) {
  console.log("in mail");
  try {
    var option = {
      from: "vastram823@gmail.com",
      // from: "webdev@laughmd.app",
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









// ============================

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


// async function addWatermarkToImage(imageBuffer, watermarkText) {
//   const sharp = require("sharp");
//   const { createCanvas, loadImage, registerFont } = require("canvas");

//   // Load your custom font (optional, for watermark text)
//   // registerFont('path/to/your/font.ttf', { family: 'CustomFont' });
//   // Create a canvas with the same dimensions as the image
//   const image = await sharp(imageBuffer);
//   const metadata = await image.metadata();
//   const canvas = createCanvas(metadata.width, metadata.height);
//   const ctx = canvas.getContext("2d");
//   const textSize = ctx.measureText(watermarkText);


// const watermarkWidthPercentage = 20; // Adjust as needed (e.g., 20% of the image width)
// const watermarkHeightPercentage = 5; // Adjust as needed (e.g., 5% of the image height)

// const watermarkWidth = (metadata.width * watermarkWidthPercentage) / 100;
// const watermarkHeight = (metadata.height * watermarkHeightPercentage) / 100;

// // Calculate the position of the watermark (e.g., bottom-right corner with a margin)
// const textX = metadata.width - watermarkWidth - 60; // Adjust the margin as needed
// const textY = metadata.height - watermarkHeight - 15; //


//   // const textX = metadata.width - textSize.width - 860; // Center horizontally
//   // const textY = metadata.height - 30;
//   // Load the image onto the canvas
//   const img = await loadImage(imageBuffer);
//   console.log(img, "image===");
//   ctx.drawImage(img, 0, 0, metadata.width, metadata.height);

//   // Add watermark text
//   // ctx.font = '30px CustomFont'; // Use your custom font here
//   ctx.font = '100px "Open Sans", sans-serif';

//   // ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
//   ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
//   // Watermark text color and opacity
//   ctx.fillText(watermarkText, textX, textY); // Adjust the position of the watermark

//   // Convert the canvas to a Buffer
//   return canvas.toBuffer("image/jpeg");
// }


async function addWatermarkToImage(imageBuffer, watermarkText) {
  const sharp = require('sharp');
  const { createCanvas, loadImage, registerFont } = require('canvas');

  // Load your custom font (optional, for watermark text)
  // registerFont('path/to/your/font.ttf', { family: 'CustomFont' });

  // Create a canvas with the same dimensions as the image
  const image = await sharp(imageBuffer);
  const metadata = await image.metadata();
  const canvas = createCanvas(metadata.width, metadata.height);
  const ctx = canvas.getContext('2d');

  console.log("==============",metadata.height,metadata.width,);




  const maxWidth = metadata.width * 0.8; // Adjust the maximum width as needed
  const maxHeight = metadata.height * 0.2; // Adjust the maximum height as needed

  // Calculate the font size based on the maximum dimensions and the watermark text
  let fontSize = 30; // Initial font size (adjust as needed)
  ctx.font = `${fontSize}px Open Sans, sans-serif`; // Use your custom font here
  var textWidth = ctx.measureText(watermarkText).width;
  console.log(textWidth,"textWidth original")
  console.log(maxWidth,"maxWidth original")
  console.log(maxHeight,"maxHeight original")
    while (textWidth > maxWidth || fontSize > maxHeight) {
    
    // Reduce the font size until it fits within the maximum dimensions
    fontSize--;
    ctx.font = `${fontSize}px Open Sans, sans-serif`;
    

    textWidth = ctx.measureText(watermarkText).width;
    console.log("in while loop =====",fontSize,textWidth);
  }
  // ctx.drawImage(img, 0, 0, metadata.width, metadata.height);

  const textSize =ctx.measureText(watermarkText);
  console.log("==============",metadata.height,metadata.width,textSize);
  const textX = (metadata.width - textWidth-20); // Center horizontally
  const textY = (metadata.height - 20);
  // Load the image onto the canvas
  const img = await loadImage(imageBuffer);
  console.log(img,"image===")
  ctx.drawImage(img, 0, 0, metadata.width, metadata.height);

  // Add watermark text
  // ctx.font = '30px CustomFont'; // Use your custom font here
  ctx.font = '30px "Open Sans", sans-serif'

  // ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillStyle ='rgba(255, 0, 0, 0.5)'
   // Watermark text color and opacity
  ctx.fillText(watermarkText, textX, textY); // Adjust the position of the watermark

  // Convert the canvas to a Buffer
  return canvas.toBuffer('image/jpeg');
}


async function pushNotification2(
  device_token,
  chatd
) {
  chatd.status="7";
  const registrationTokens = device_token;

  const notificationPayload = {
    notification: {
      title: " "+chatd.name + "",
      body: ""+chatd.newMessage+" ",
    },
    // Add any additional data you want to send
    data: chatd,
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







// const nodemailer = require('nodemailer');

// // Create a transporter object
// var from="ns2.carmothosting.com"
// const transporter1 = nodemailer.createTransport({
//   // host: 'hello@laughmd.app', // e.g., smtp.gmail.com for Gmail
//   // host:"5597810.carmothosting.com",
//   host:from,
//   port: 465, // Port number (can be different for different email providers)
//   secure: false, // Set to true if using SSL
//   auth: {
//     user: 'hello@laughmd.app',
//     pass: 'Dr)nLl{d0dB$'
//   }
// });

// // Email content
// const mailOptions = {
//   from: from,
//   to: 'durgeshrathore060@gmail.com',
//   subject: 'Test Email',
//   text: 'This is a test email sent from Node.js.'
// };

// // Send the email
// transporter1.sendMail(mailOptions, (error, info) => {
//   console.log(" in   dddddddddweb mail")
//   if (error) {
//     console.error(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
  
//   // Close the transporter1 to release resources
//   transporter1.close();
// });

async function savePushNotification(user_id,notification,status){


  var obj={
    user_id:user_id,
    notifcation_masage:notification,
    type:status
  }
await save("notification",obj);

var sql=`SELECT COUNT(*) AS cou FROM notification WHERE user_id=${login_user_id} AND is_seen=0`;
console.log(sql," dddddd");
connection.query(sql,(err,counts)=>{
  if(err){
console.log(err);
  }else
  if (counts) {

io.emit('notificationCount', { message: counts[0].cou  });
    }})

}



module.exports = {
  save,
  findOne,
  findByIdAndUpdate,
  sendMail,
  pushNotification,
  pushNotification1,
  pushNotification2,
  addWatermarkToImage,
  savePushNotification
};
