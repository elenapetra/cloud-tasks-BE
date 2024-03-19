const AWS = require("aws-sdk");
const s3 = new AWS.S3({ region: "eu-west-1" });

module.exports.importProductsFile = async (event) => {
  try {
    const fileName = event.queryStringParameters.name;

    const signedUrl = s3.getSignedUrl("putObject", {
      Bucket: "import-products-data-bucket",
      Key: `uploaded/${fileName}`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ signedUrl }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
