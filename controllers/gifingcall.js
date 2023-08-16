// const axios = require("axios");
// const Client = require("dwolla-v2").Client;

// const dwollaApiKey = "gAvWg0Bhcse1tXUkN2PgdPButgCdfOIuWw7eeVsAVRI2mugCzp";
// const dwollaApiSecret = "ABjaijSSo5toaSUubw1z4rdYTTlkVaDQqJFnmuvAZvtjGNtNkq";

// const dwolla = new Client({
//   environment: "sandbox", // Defaults to "production"
//   key: dwollaApiKey,
//   secret: dwollaApiSecret,
// });

// async function createDwollaCustomer(data) {
//   await dwolla
//     .post("customers", {
//       firstName: data.firstName ? data.firstName : "",
//       lastName: data.lastName ? data.lastName : "",
//       email: data.email,
//     })
//     .then((res) => {
//       console.log("res =========222222 ", res.headers.get("location"));
//     })
//     .catch((err) => {
//       console.log("err====", err);
//     });
// }

// const senderAccountId = '97336de6-15ac-4b0a-a8c0-dd0a1e481ce0';
// const receiverAccountId = '59d754c6-4e7e-4b4f-971b-d916802790f3';

// Using dwolla-v2 - https://github.com/Dwolla/dwolla-v2-node

// async function fundingSource() {
//   var customerUrl =
//     "https://api-sandbox.dwolla.com/customers/59d754c6-4e7e-4b4f-971b-d916802790f3";
//   var requestBody = {
//     routingNumber: "222222226",
//     accountNumber: "123456589",
//     bankAccountType: "checking",
//     name: "Second users",
//   };

//   dwolla
//     .post(`${customerUrl}/funding-sources`, requestBody)
//     .then((res) =>
//       console.log(
//         "ddddddd funding tranfer post===",
//         res.headers.get("location")
//       )
//     )
//     .catch((err) => {
//       console.log("funding transfer====",err);
//     }); // => 'https://api-sandbox.dwolla.com/funding-sources/375c6781-2a17-476c-84f7-db7d2f6ffb31'
// }

// fundingSource();
// async function getFundingSource(){

// var fundingSourceUrl =
//   "https://api.dwolla.com/funding-sources/277eba0b-1e2d-4ecd-8694-384cbebdbb55";

// await dwolla.get(fundingSourceUrl).then(function(res) {
//   console.log("ddd===11122",res.body.name); // => 'Test checking account'
// }).catch(err=>{console.log("getFunding error====",err)});
// }
// getFundingSource();

// async function microDeposits(){
// var fundingSourceUrl =
//   "https://api-sandbox.dwolla.com/funding-sources/277eba0b-1e2d-4ecd-8694-384cbebdbb55";

//   var requestBody = {
//     amount1: {
//       value: "0.03",
//       currency: "USD",
//     },
//     amount2: {
//       value: "0.09",
//       currency: "USD",
//     },
//   };

// await dwolla.post(`${fundingSourceUrl}/micro-deposits`,requestBody).then(res=>{
//     console.log(res,"  res of microDeposits")
// }).catch(err=>{console.log(err," err in microDeposits===")});

// }
// microDeposits();


// async function tranfer1() {
//   var transferRequest = {
//     _links: {
//       source: {
//         href: "https://api-sandbox.dwolla.com/c9d0e4bd-aecd-499d-81e3-352c9b39dbc1",
//       },
//       destination: {
//         href: "https://api-sandbox.dwolla.com/funding-sources/277eba0b-1e2d-4ecd-8694-384cbebdbb55",
//       },
//     },
//     amount: {
//       currency: "USD",
//       value: 2.00,
//     },
//   };

//   dwolla
//     .post("transfers", transferRequest)
//     .then(function (res) {
//       console.log("for the link of ", res.headers.get("location")); // => 'https://api-sandbox.dwolla.com/transfers/d76265cd-0951-e511-80da-0aa34a9b2388'
//     })
//     .catch((err) => {
//       console.log("error at the time of tranfer===", err);
//     });
// }




// async function tranfer() {
// // Using dwolla-v2 - https://github.com/Dwolla/dwolla-v2-node
// var headers = {
//     "Idempotency-Key": "19051a62-3403-11e6-ac61-9e71128cae77",
//   };
// var requestBody = {
//     "_links": {

//         "source": {
//             "href": "https://api-sandbox.dwolla.com/c9d0e4bd-aecd-499d-81e3-352c9b39dbc1",
//           },
//           "destination": {
//             "href": "https://api-sandbox.dwolla.com/funding-sources/277eba0b-1e2d-4ecd-8694-384cbebdbb55",
//           },
//     //   source: {
//     //     href: "https://api-sandbox.dwolla.com/funding-sources/707177c3-bf15-4e7e-b37c-55c3898d9bf4",
//     //   },
//     //   destination: {
//     //     href: "https://api-sandbox.dwolla.com/funding-sources/AB443D36-3757-44C1-A1B4-29727FB3111C",
//     //   },
//     },
//     "amount": {
//       "currency": "USD",
//       "value": "1.00",
//     },
//     "metadata": {
//       "paymentId": "12345678",
//       "note": "payment for completed work Dec. 1",
//     },
//     "clearing": {
//       "destination": "next-available",
//     },
//     "achDetails": {
//       "source": {
//         "addenda": {
//           "values": ["ABC123_AddendaValue"],
//         },
//       },
//       "destination": {
//         "addenda": {
//           "values": ["ZYX987_AddendaValue"],
//         },
//       },
//     },
//     "correlationId": "8a2cdc8d-629d-4a24-98ac-40b735229fe2",
//   };
  
//   dwolla
//     .post("transfers", requestBody,headers)
//     .then((res) => console.log(res.headers.get("location")))
//     .catch(err=>{console.log(err,"tranfert time")}); 
//     // => 'https://api-sandbox.dwolla.com/transfers/74c9129b-d14a-e511-80da-0aa34a9b2388'
// }
  
// tranfer();

// async function checkTranferStatus() {
//   var transferUrl =
//     "https://api.dwolla.com/transfers/d76265cd-0951-e511-80da-0aa34a9b2388";

//   dwolla.get(transferUrl).then(function (res) {
//     res.body.status; // => 'processed'
//   });
// }
// checkTranferStatus();
