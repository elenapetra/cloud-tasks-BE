const AWS = require("aws-sdk");
const sns = new AWS.SNS({ region: "eu-west-1" });
const lambda = new AWS.Lambda({ region: "eu-west-1" });

module.exports.catalogBatchProcess = async (event) => {
  try {
    for (const record of event.Records) {
      const messageBody = JSON.parse(record.body);
      const { title, description, price, count } = messageBody;

      const params = {
        FunctionName: "product-service-dev-createProduct",
        Payload: JSON.stringify({ title, description, price, count }),
      };
      const invokeResponse = await lambda.invoke(params).promise();

      if (invokeResponse.Payload) {
        console.log(
          "createProduct Lambda invoked successfully:",
          invokeResponse.Payload
        );
      } else {
        console.error("Empty response from createProduct Lambda");
      }

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
    const message = {
      title: title,
      description: description,
      price: price,
      count: count,
    };

    const params = {
      Subject: "The newly created object",
      Message: JSON.stringify(message),
      TopicArn: process.env.SNS_ARN,
    };

    await sns.publish(params).promise();
  } catch (error) {
    console.error("Error publishing event to SNS:", error);
    throw error;
  }
}
