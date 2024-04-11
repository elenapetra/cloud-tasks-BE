const AWS = require("aws-sdk");
const csv = require("csv-parser");
const s3 = new AWS.S3({ region: "eu-west-1" });
const bucketName = "import-products-data-bucket";

module.exports.importFileParser = async (event) => {
  try {
    await Promise.all(
      event.Records.map(async (record) => {
        const key = record.s3.object.key;
        const s3Stream = s3
          .getObject({
            Bucket: bucketName,
            Key: key,
          })
          .createReadStream();

        await new Promise((resolve, reject) => {
          s3Stream
            .pipe(csv())
            .on("data", (data) => {
              console.log("Parsed record:", data);
            })
            .on("end", () => {
              console.log("Copy from " + bucketName + "/" + key);
              resolve();
            })
            .on("error", (error) => {
              console.error("Error processing file:", key, error);
              reject(error);
            });
        });
      })
    );
  } catch (error) {
    console.error("Error processing S3 event:", error);
  }
};
