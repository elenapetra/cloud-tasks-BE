const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const generateUniqueId = require("../src/utils/generateUniqueId");
const sns = new AWS.SNS({ region: "eu-west-1" });

module.exports.catalogBatchProcess = async (event) => {
  try {
    for (const record of event.Records) {
      const messageBody = JSON.parse(record.body);
      const { title, description, price, count } = messageBody;

      await storeDataIntoDB(title, description, price, count);
      await publishEventToSNS(title, description, price, count);
    }
    return { statusCode: 200, body: "Messages consumed successfully" };
  } catch (error) {
    console.error("Error consuming messages from SQS:", error);
    throw error;
  }
};

async function storeDataIntoDB(title, description, price, count) {
  try {
    const productId = generateUniqueId();

    const productParams = {
      TableName: process.env.PRODUCTS_TABLE,
      Item: {
        id: productId,
        title: title,
        description: description,
        price: price,
      },
    };

    const stockParams = {
      TableName: process.env.STOCKS_TABLE,
      Item: {
        product_id: productId,
        count: count,
      },
    };

    await Promise.all([
      dynamodb.put(productParams).promise(),
      dynamodb.put(stockParams).promise(),
    ]);

    const responseData = {
      data: {
        id: productId,
        title: title,
        description: description,
        price: price,
        count: count,
      },
      message: "Product created successfully",
      error: null,
    };

    return {
      statusCode: 201,
      body: JSON.stringify(responseData),
    };
  } catch (error) {
    console.error("Error storing data into DB:", error);
    throw error;
  }
}

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
