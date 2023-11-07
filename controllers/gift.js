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

exports.searchGift= function(req,res) {
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

  amazonPaapi
    .SearchItems(commonParameters, requestParameters)
    .then((data) => {
      // do something with the success response.
      JSON.stringify(data);
      console.log(
        " dddddddddd======",
        JSON.stringify(data),
        "==========="
        
      );
      return res.json({
        response: [],
        success: true,
        message: "gift data .",
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