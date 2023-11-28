const amazonPaapi = require("amazon-paapi");
// accessKey = 'AKIAJBCOXCXX6YAQD7PA';
// secretKey = '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';

// defaultClient.host = 'webservices.amazon.com';
// defaultClient.region = 'us-east-1';

const commonParameters = {
  AccessKey: "AKIAJBCOXCXX6YAQD7PA",
  SecretKey: "/F0OphnfTSLKtrF6IQSf3UR97eHCM5m6rz5LSiaL",
  PartnerTag: "forgetmenote-20", // yourtag-20
  PartnerType: "Associates", // Default value is Associates.
  Marketplace: "www.amazon.com", // Default value is US. Note: Host and Region are predetermined based on the marketplace value. There is no need for you to add Host and Region as soon as you specify the correct Marketplace value. If your region is not US or .com, please make sure you add the correct Marketplace value.
};

exports.amazonProductList= function(req,res) {
  const requestParameters = {
    // Keywords: req.query.searchingTitle,
    // SearchIndex: req.query.category,
    ItemCount: 4,
    // ItemPage:2,
    Resources: [
      "Images.Primary.Medium",
      "ItemInfo.Title",
      "Offers.Listings.Price",
      "ItemInfo.ContentRating"
    ],
  };

  if(req.query.searchingTitle){
    requestParameters.Keywords=req.query.searchingTitle
  }

  if(req.query.category){
    requestParameters.SearchIndex=req.query.category
  }
  if (req.query.page>=1) {
    requestParameters.ItemPage = (req.query.page*1)+1;
  }
  console.log(requestParameters," ======request Parameters===");

  /** Promise */
  var a;
  amazonPaapi
    .SearchItems(commonParameters, requestParameters)
    .then((data) => {
      // do something with the success response.
      
      a=JSON.stringify(data);
      console.log(data,
        " dddddddddd======",
        JSON.stringify(data),
        "===========",a
        
      );
      return res.json({
        response: data.SearchResult.Items,
        success: true,
        message: "product list  .",
      });
    })
    .catch((error) => {
      // catch an error.
      console.log(error);
    });
}

// const requestParameters = {
//   Keywords: "Harry Potter",
//   SearchIndex: "Books",
//   ItemCount: 2,
//   Resources: [
//     "Images.Primary.Medium",
//     "ItemInfo.Title",
//     "Offers.Listings.Price",
//   ],
// };

exports.productDetails= function(req,res) {
  const requestParameters = {
    
      ItemIds: [`${req.query.asin_no}`],
      PartnerTag: "forgetmenote-20",
      Resources: ["Images.Primary.Small", "ItemInfo.ContentRating","ItemInfo.Title","ItemInfo.Features", "Offers.Summaries.HighestPrice","ParentASIN"]

    
  };

  /** Promise */
  var a;
  amazonPaapi
    .GetItems(commonParameters, requestParameters)
    .then((data) => {
      // do something with the success response.
      
      a=JSON.stringify(data);
      console.log(data.ItemsResult,
        " dddddddddd======"    
        
      );
      return res.json({
        response: data.ItemsResult,
        success: true,
        message: "product list  .",
      });
    })
    .catch((error) => {
      // catch an error.
      console.log(error);
    });
}

// exports.productDetails= function(req,res) {
//   const requestParameters = 
//   {
    
//       ItemIds: [`${req.query.asin_no}`],
//       // Keywords: "Design art",
//       PartnerTag: "forgetmenote-20",
//       Resources: ["Images.Primary.Small", "ItemInfo.ContentRating","ItemInfo.Title","ItemInfo.Features", "Offers.Summaries.HighestPrice","ParentASIN"]

    
//   };
// //   {
// //     "PartnerTag": "forgetmenote-20",
// //     "ItemIds": [`${req.query.asin_no}`],
// //     "Resources": [
// //         "ItemInfo.ByLineInfo",
// //         "ItemInfo.ContentInfo",
// //         "ItemInfo.ContentRating",
// //         "ItemInfo.Classifications",
// //         "ItemInfo.ExternalIds",
// //         "ItemInfo.Features",
// //         "ItemInfo.ManufactureInfo",
// //         "ItemInfo.ProductInfo",
// //         "ItemInfo.TechnicalInfo",
// //         "ItemInfo.Title",
// //         "ItemInfo.TradeInInfo"
// //     ]
// // }
// // {
// //   "PartnerTag": "forgetmenote-20",
// //   "PartnerType": "Associates",
// //   "Keywords": "watches",
// //   "DeliveryFlags": ["Prime"]
// // }



//   /** Promise */
//   var a;
//   amazonPaapi
//     .GetItems(commonParameters, requestParameters)
//     .then((data) => {
//       // do something with the success response.
      
//       a=JSON.stringify(data);
//       console.log(data,
//         " dddddddddd======"    
        
//       );
//       return res.json({
//         response: data.SearchResult,
//         success: true,
//         message: "product list  .",
//       });
//     })
//     .catch((error) => {
//       // catch an error.
//       console.log(error);
//     });
// // }




//  exports.amazonCategoryList= function(req,res) {
//   const requestParameters = {
//     "Keywords": "category For female",
//     "Resources": ["SearchRefinements"],
//     "PartnerTag": "forgetmenote-20",
//     "PartnerType": "Associates",
//     "Marketplace": "www.amazon.com",
//     "Operation": "SearchItems"
//    }

//   /** Promise */
//     amazonPaapi
//     .SearchItems(commonParameters, requestParameters)
//     .then((data) => {
//       // do something with the success response.
//       data=data["SearchResult"]["SearchRefinements"]
//       console.log("ddd==0",data.SearchIndex );
      
//       return res.json({
//         response: data.SearchIndex.Bins,
//         success: true,
//         message: "Category List  .",
//       });
//     })
//     .catch((error) => {
//       // catch an error.
//       console.log(error);
//     });
// }
var connection = require("../config/db");

exports.amazonCategoryList= function(req,res) {
  var sql=`SELECT * FROM amazon_category`;
 
  connection.query(sql,     
    function (err, categoryData) {
      console.log(err);    
      return res.json({
        response: categoryData,
        success: true,
        message: "Category List  .",
      });
    })
   
}
exports.categoryAccordingToG= function(req,res) {
  const requestParameters = {
    // "Keywords": "category",
    "Resources": ["BrowseNodes.Ancestor", "BrowseNodes.Children"],
    "BrowseNodeIds": ["B01M0GB8CC", "B0851ZPB5C"],
    "PartnerTag": "forgetmenote-20",
    "PartnerType": "Associates",
    // "Marketplace": "www.amazon.com",
    // "Operation": "SearchItems"
   }

  /** Promise */
    amazonPaapi
    .SearchItems(commonParameters, requestParameters)
    .then((data) => {
      // do something with the success response.
      console.log(data," ======ddddddd");
      data=data["SearchResult"]["SearchRefinements"]
      console.log("ddd==0", );
      return res.json({
        response: data.SearchIndex.Bins,
        success: true,
        message: "Category List  .",
      });
    })
    .catch((error) => {
      // catch an error.
      console.log(error);
    });
}

// {
//   "PartnerTag": "xyz-20",
//   "PartnerType": "Associates",
//   "ItemIds": ["8424916514"],
//   "LanguagesOfPreference": ["es_US"]
// }


// exports.productDetails= function(req,res) {
//   const requestParameters = {
    
//       ItemIds: ["B01M0GB8CC"],
//       // ItemIdType: "ASIN",
//       // LanguagesOfPreference: ["en_US"],
//       // Marketplace: "www.amazon.com",
//       PartnerTag: "forgetmenote-20",
//       // PartnerType: "Associates",
//       Resources: ["Images.Primary.Small","ItemInfo.Title","ItemInfo.Features", "Offers.Summaries.HighestPrice","ParentASIN"]

    
//   };

//   /** Promise */
//   var a;
//   amazonPaapi
//     .GetItems(commonParameters, requestParameters)
//     .then((data) => {
//       // do something with the success response.
      
//       a=JSON.stringify(data);
//       console.log(data.ItemsResult,
//         " dddddddddd======"    
        
//       );
//       return res.json({
//         response: data.ItemsResult,
//         success: true,
//         message: "product list  .",
//       });
//     })
//     .catch((error) => {
//       // catch an error.
//       console.log(error);
//     });
// }



exports.getProductDetails= async function(asinId,req,res) {
  console.log(asinId," ====== ASIN number or id of products=");
  asinId=asinId.split(',');
  const requestParameters = {
    
      // ItemIds: [`${asinId}`],
      ItemIds: asinId,
      PartnerTag: "forgetmenote-20",
      Resources: ["Images.Primary.Small", "ItemInfo.ContentRating","ItemInfo.Title","ItemInfo.Features", "Offers.Summaries.HighestPrice","ParentASIN"]

    
  };

  /** Promise */
  var a;
  amazonPaapi
    .GetItems(commonParameters, requestParameters)
    .then((data) => {
      // do something with the success response.
      
      a=JSON.stringify(data);
      console.log(data.ItemsResult,
        " dddddddddd======"    
        
      );
      return res.json({
            success: true,
            response:data.ItemsResult,
            message: "Wishlist.",
          });
        
      // else {
      //     return res.json({
      //       success: false,
      //       response:[],
      //       message: "Wishlist.",
      //     });
      //   }
      // return data.ItemsResult;
    
    })
    .catch((error) => {
      // catch an error.

        return res.json({
            success: false,
            response:[],
            message: "Wishlist.",
          });
      
    });
}