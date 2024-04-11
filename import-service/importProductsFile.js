const AWS = require("aws-sdk");
const s3 = new AWS.S3({ region: "eu-west-1" });
const bucketName = "import-products-data-bucket";

module.exports.importProductsFile = async (event) => {
  try {
    const fileName = event.queryStringParameters.name;

    const params = {
      Bucket: bucketName,
      Key: `uploaded/${fileName}`,
      ContentType: "text/csv",
    };

    return new Promise((resolve, reject) => {
      s3.getSignedUrlPromise("putObject", params, (error, url) => {
        if (error) {
          return reject(error);
        }
        resolve({
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          body: url,
        });
      });
    });
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
