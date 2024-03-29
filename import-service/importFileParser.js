const AWS = require("aws-sdk");
const csv = require("csv-parser");
const s3 = new AWS.S3({ region: "eu-west-1" });
const sqs = new AWS.SQS({ region: "eu-west-1" });
const bucketName = "import-products-data-bucket";
const queueUrl = process.env.SQS_QUEUE_URL;
const util = require("util");
const stream = require("stream");
const pipeline = util.promisify(stream.pipeline);

module.exports.importFileParser = async (event) => {
  try {
    await Promise.all(
      event.Records.map(async (record) => {
        const key = record.s3.object.key;
        const s3Stream = s3
          .getObject({ Bucket: bucketName, Key: key })
          .createReadStream();

        await pipeline(
          s3Stream,
          csv(),
          new stream.Transform({
            objectMode: true,
            async transform(data, encoding, callback) {
              if (
                !data.description ||
                !data.price ||
                !data.title ||
                !data.count
              ) {
                console.error("Incomplete data found, skipping message:", data);
                return callback();
              }
              try {
                await sqs
                  .sendMessage({
                    QueueUrl: queueUrl,
                    MessageBody: JSON.stringify(data),
                  })
                  .promise();
                callback();
              } catch (error) {
                console.error("Error sending message to SQS:", error);
                callback(error);
              }
            },
          })
        );
      })
    );
    return { statusCode: 200, body: "Files processed successfully" };
  } catch (error) {
    console.error("Error processing S3 event:", error);
    throw error;
  }
};
