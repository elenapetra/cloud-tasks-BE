const AWS = require("aws-sdk");
const generateUniqueId = require("../src/utils/generateUniqueId");

AWS.config.update({ region: "eu-west-1" });
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.createProduct = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const productId = generateUniqueId();

    const productParams = {
      TableName: process.env.PRODUCTS_TABLE,
      Item: {
        id: productId,
        title: data.title,
        description: data.description,
        price: data.price,
      },
    };

    const stockParams = {
      TableName: process.env.STOCKS_TABLE,
      Item: {
        product_id: productId,
        count: data.count,
      },
    };

    await Promise.all([
      dynamodb.put(productParams).promise(),
      dynamodb.put(stockParams).promise(),
    ]);

    const responseData = {
      data: {
        id: productId,
        title: data.title,
        description: data.description,
        price: data.price,
        count: data.count,
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
