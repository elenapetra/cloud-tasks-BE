const AWS = require("aws-sdk");
const sns = new AWS.SNS({ region: process.env.REGION });
const lambda = new AWS.Lambda({ region: process.env.REGION });

module.exports.catalogBatchProcess = async (event) => {
  try {
    for (const record of event.Records) {
      const messageBody = JSON.parse(record.body);
      const { title, description, price, count } = messageBody;

      const params = {
        FunctionName: "product-service-dev-createProduct",
        Payload: JSON.stringify({ title, description, price, count }),
      };
      await lambda.invoke(params).promise();
      await publishEventToSNS(title, description, price, count);
    }
    return { statusCode: 200, body: "Messages consumed successfully" };
  } catch (error) {
    console.error("Error consuming messages from SQS:", error);
    throw error;
  }
};

async function publishEventToSNS(title, description, price, count) {
  try {
    const message = { title, description, price, count };

    const params = {
      Subject: "The newly created product",
      Message: JSON.stringify(message),
      TopicArn: process.env.SNS_ARN,
    };

    await sns.publish(params).promise();
  } catch (error) {
    console.error("Error publishing event to SNS:", error);
    throw error;
  }
}
