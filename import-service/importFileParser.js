const AWS = require("aws-sdk");
const csv = require("csv-parser");
const s3 = new AWS.S3({ region: "eu-west-1" });
const bucketName = "import-products-data-bucket";

module.exports.importFileParser = async (event) => {
  event.Records.forEach((record) => {
    const key = record.s3.object.key;

    const s3Stream = s3
      .getObject({
        Bucket: bucketName,
        Key: key,
      })
      .createReadStream();

    s3Stream
      .pipe(csv())
      .on("data", (data) => {
        console.log("Parsed record:", data);
      })
      .on("end", async () => {
        console.log("Copy from " + bucketName + "/" + key);
      });
  });
};
