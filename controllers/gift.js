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

exports.productSearchOfSearch= function(req,res) {
  const requestParameters = {
    Keywords: req.query.searchingTitle,
    SearchIndex: req.query.category,
    ItemCount: 2,
    Resources: [
      "Images.Primary.Medium",
      "ItemInfo.Title",
      "Offers.Listings.Price",
    ],
  };

  /** Promise */
  var a;
  amazonPaapi
    .SearchItems(commonParameters, requestParameters)
    .then((data) => {
      // do something with the success response.
      
      // a=JSON.stringify(data);
      // console.log(data,
      //   " dddddddddd======",
      //   JSON.stringify(data),
      //   "===========",a
        
      // );
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





 exports.categorySearchOfSearch= function(req,res) {
  const requestParameters = {
    "Keywords": "category",
    "Resources": ["SearchRefinements"],
    "PartnerTag": "forgetmenote-20",
    "PartnerType": "Associates",
    "Marketplace": "www.amazon.com",
    "Operation": "SearchItems"
   }

  /** Promise */
    amazonPaapi
    .SearchItems(commonParameters, requestParameters)
    .then((data) => {
      // do something with the success response.
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


exports.productDetails= function(req,res) {
  const requestParameters = {
    
      ItemIds: ["B01M0GB8CC","B0851ZPB5C"],
      // ItemIdType: "ASIN",
      LanguagesOfPreference: ["en_US"],
      // Marketplace: "www.amazon.com",
      PartnerTag: "forgetmenote-20",
      PartnerType: "Associates",
      // Resources: ["Images.Primary.Small","ItemInfo.Title","ItemInfo.Features", "Offers.Summaries.HighestPrice","ParentASIN"]

    
  };

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