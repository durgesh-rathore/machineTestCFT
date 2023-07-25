
// const fetch = require('node-fetch');
// const axios=require('axios');

// const axios = require('axios');

// const accessKey = 'AKIAJBNQWSFQQVPLAJKQ';  // Replace with your Access Key ID
// const secretKey = 'YOUR_SECRET_KEYa9SkvzeXOYj9FwuFpzNKd2uk0ooYKZL9nVku6oHC';  // Replace with your Secret Access Key
// const associateTag = 'forgetmenote-20';  // Replace with your Amazon Associate Tag
// const productASIN = 'B07XYZ1234';  // Replace with the ASIN of the product you want to retrieve variations for

// const endpoint = 'https://webservices.amazon.com/paapi5/getvariations';
// const params = {
//   ASIN: productASIN,
//   Resources: [
//     'Images.Primary.Medium',
//     'ItemInfo.Title',
//     'Offers.Listings.Price',
//     'VariationSummary.VariationDimension'
//   ],
//   PartnerTag: associateTag,
//   PartnerType: 'Associates', // Replace with 'Associates' if you are an Associate
//   AWSAccessKeyId: accessKey,
// };

// axios.get(endpoint, { params })
//   .then(response => {
//     const data = response.data;
//     console.log(data);
//     // Process the data as needed
//   })
//   .catch(error => {
//     console.error('Error fetching variations:', error,error.response.data);
//   });


// async function fetchAmazonData1() {
//   const url = 'https://webservices.amazon.com/paapi5/searchitems.in';
//   const headers = {
//     'Host': 'webservices.amazon.com',
//     'Content-Type': 'application/json; charset=UTF-8',
//     'X-Amz-Date': '20230718T124857Z',
//     'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
//     'Content-Encoding': 'amz-1.0',
//     'User-Agent': 'paapi-docs-curl/1.0.0',
//     'Authorization': 'AWS4-HMAC-SHA256 Credential=AKIAJBNQWSFQQVPLAJKQ/20230718/us-east-1/ProductAdvertisingAPI/aws4_request SignedHeaders;host;x-amz-date;x-amz-target Signature=aebe598ca31280a84ca95373bb57d23f69a847e314e1a55cff6f9d5e5d399f61',
//   };

//   const body = JSON.stringify({
//     'Marketplace': 'https://www.amazon.com',
//     'PartnerType': 'Associates',
//     'PartnerTag': 'dd',
//     'Keywords': 'kindle',
//     'SearchIndex': 'All',
//     'ItemCount': 3,
//     'Resources': ['Images.Primary.Large', 'ItemInfo.Title', 'Offers.Listings.Price'],
//   });

//   try {
//     const response = await axios.post(url, {
//       method: 'POST',
//       headers,
//       body,
//     });

//     const data = await response.json();
//     console.log(data); // Process the response data here

//   } catch (error) {
//     console.error('Error:', error,error.message);
//   }
// }

// const axios = require('axios');

// async function fetchAmazonData() {
//   const url = 'https://webservices.amazon.com/paapi5/searchitems.in';
//   const headers = {
//     'Host': 'webservices.amazon.com',
//     'Content-Type': 'application/json; charset=UTF-8',
//     'X-Amz-Date': '20230718T124857Z',
//     'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
//     'User-Agent': 'paapi-docs-curl/1.0.0',
//     'Authorization': 'AWS4-HMAC-SHA256 Credential= AKIAJBNQWSFQQVPLAJKQ/20230718/us-east-1/ProductAdvertisingAPI/aws4_request SignedHeaders=content-type;host;x-amz-date;x-amz-target Signature=a9SkvzeXOYj9FwuFpzNKd2uk0ooYKZL9nVku6oHC',
//   };

//   const data = {
//     'Marketplace': 'https://www.amazon.com',
//     'PartnerType': 'Associates',
//     'PartnerTag': 'forgetmenote-20', // Replace with your Amazon Associates partner tag
//     'Keywords': 'kindle',
//     'SearchIndex': 'All',
//     'ItemCount': 3,
//     'Resources': ['Images.Primary.Large', 'ItemInfo.Title', 'Offers.Listings.Price'],
//   };

//   try {
//     const response = await axios.post(url, data, { headers });

//     console.log('Response:', response.data); // Process the response data here

//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// }

// fetchAmazonData();



// fetchAmazonData();















// Call the function to execute the fetch request
// fetchAmazonData();

// const axios = require('axios');
// const crypto = require('crypto');

// Replace these with your actual API credentials

// const ACCESS_KEY = 'AKIAJBNQWSFQQVPLAJKQ';
// const SECRET_KEY = 'a9SkvzeXOYj9FwuFpzNKd2uk0ooYKZL9nVku6oHC';
// const ASSOCIATE_TAG = 'forgetmenote-20';

// // Define the search query and other parameters
// const searchQuery = 'laptop';
// const searchIndex = 'Electronics'; // You can change this to a different search index
// const responseGroup = 'ItemAttributes,Images'; // Include additional item attributes and images in the response

// // Function to generate the Amazon Product Advertising API signature
// function generateSignature(url) {
//   const timestamp = new Date().toISOString();
//   const signatureInput = `GET\nwebservices.amazon.com\n/onca/xml\n${url}\nAWSAccessKeyId=${ACCESS_KEY}&AssociateTag=${ASSOCIATE_TAG}&Operation=ItemSearch&SearchIndex=${searchIndex}&Keywords=${searchQuery}&ResponseGroup=${responseGroup}&Timestamp=${encodeURIComponent(timestamp)}`;

//   return crypto.createHmac('sha256', SECRET_KEY).update(signatureInput).digest('base64');
// }

// // Function to make the API call and get product search results
// async function getProductSearchResults() {
//   const timestamp = new Date().toISOString();
//   const signature = generateSignature(`AWSAccessKeyId=${ACCESS_KEY}&AssociateTag=${ASSOCIATE_TAG}&Operation=ItemSearch&SearchIndex=${searchIndex}&Keywords=${searchQuery}&ResponseGroup=${responseGroup}&Timestamp=${encodeURIComponent(timestamp)}`);

//   const url = `http://webservices.amazon.com/onca/xml?AWSAccessKeyId=${ACCESS_KEY}&AssociateTag=${ASSOCIATE_TAG}&Operation=ItemSearch&SearchIndex=${searchIndex}&Keywords=${searchQuery}&ResponseGroup=${responseGroup}&Timestamp=${encodeURIComponent(timestamp)}&Signature=${encodeURIComponent(signature)}`;

//   try {
//     const response = await axios.get(url);
//     // Process the response here (e.g., extract and display product information)
//     console.log(response.data);
//   } catch (error) {
//     console.error('Error making API call:', error);
//   }
// }

// // Call the function to get the product search results
// getProductSearchResults();

















// const axios = require('axios');

// API Request Configuration
// const requestConfig = {
//   method: 'post',
//   url: 'https://webservices.amazon.com/',
//   headers: {
//     'Content-Type': 'application/json; charset=utf-8',
//     'Content-Encoding': 'amz-1.0',
//     'x-amz-date': '20160925T120000Z',
//     'x-amz-target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
//     'Authorization': 'AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE, SignedHeaders=content-type;host;x-amz-date;x-amz-target, Signature=&5d672d79c15b13162d9279b0855cfba6789a8edb4c82c400e06b5924a6f2b5d7;'
//   },
//   data: {} // Replace this with your actual JSON payload if required.
// };

// // Make the API request
// axios(requestConfig)
//   .then((response) => {
//     console.log('Response:', response.data);
//   })
//   .catch((error) => {
//     console.error('Error:',error, error.message);
//   });






// "use strict"

// const ACCESS_KEY = 'AKIAJBNQWSFQQVPLAJKQ';
// const SECRET_KEY = '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';
// const ASSOCIATE_TAG = 'forgetmenote-20 ';

// const util = require('util')
// const OperationHelper = require('apac').OperationHelper

// let opHelper = new OperationHelper({
//     awsId: 'AKIAQII73ULSYM4OY7UZ',
//     awsSecret: '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',
//     assocId: 'forgetmenote-20'
// })

// const operation = 'ItemSearch'
// const params = {
//     'SearchIndex': 'Electronic',
//     'Keywords': 'Mouse',
//     'ResponseGroup': 'ItemAttributes,Offers'
// }

// opHelper.execute(operation, params).then((results, responseBody) => {
//     console.log("11111111111111111111111",results,results.result.html.body)
//     console.log("22222222222222222222222",responseBody);
// }).catch((err) => {

//     console.error("333333333333333333333333",err);
// })

// or if you have async/await support...

// try {
//     let response = 
//     opHelper.execute(operation, params)
//     response.then(resutl=>{console.log(resutl)});
//     console.log("4444444444444444444",response);
//     console.log("55555555555555555555",response.responseBody)
// } catch(err) {
//     console.error("6666666666666666666",err);
// }

// traditional callback style is also supported for backwards compatibility

// opHelper.execute('ItemSearch', {
//     'SearchIndex': 'Books',
//     'Keywords': 'harry potter',
//     'ResponseGroup': 'ItemAttributes,Offers'
// }, function (err, results) {

//     console.log("77777777777777777777",results);
// })




// const {OperationHelper} = require('apac');
 
// const opHelper = new OperationHelper({
//     awsId:     'AKIAQII73ULSYM4OY7UZ',
//     awsSecret: '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',
//     assocId:   'forgetmenote-20'
//     // assocId:   'dd'
// });
 
// opHelper.execute('ItemSearch', {
//   'SearchIndex': 'Books',
//   'Keywords': 'harry potter',
//   'ResponseGroup': 'ItemAttributes,Offers'
// }).then((response) => {
//     console.log("Results object: ", response.result);
//     console.log("Raw response body: ", response.responseBody);
// }).catch((err) => {
//     console.error("Something went wrong! ", err);
// });