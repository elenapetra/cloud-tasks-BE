const AWS = require("aws-sdk");
const generateUniqueId = require("../src/utils/generateUniqueId");

AWS.config.update({ region: "eu-west-1" });
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.createProduct = async (event) => {
  try {
    const productId = generateUniqueId();

    const productParams = {
      TableName: process.env.PRODUCTS_TABLE,
      Item: {
        id: productId,
        title: event.title,
        description: event.description,
        price: event.price,
      },
    };

    const stockParams = {
      TableName: process.env.STOCKS_TABLE,
      Item: {
        product_id: productId,
        count: event.count,
      },
    };

    await Promise.all([
      dynamodb.put(productParams).promise(),
      dynamodb.put(stockParams).promise(),
    ]);

    const responseData = {
      data: {
        id: productId,
        title: event.title,
        description: event.description,
        price: event.price,
        count: event.count,
      },
      message: "Product created successfully",
      error: null,
    };

    return {
      statusCode: 201,
      body: JSON.stringify(responseData),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error creating product", error }),
    };
  }
};
