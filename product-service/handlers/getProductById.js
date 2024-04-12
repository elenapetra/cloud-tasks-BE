const AWS = require("aws-sdk");

AWS.config.update({ region: process.env.REGION });
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.getProductById = async (event) => {
  try {
    const productId = event.pathParameters.productId;

    const productParams = {
      TableName: process.env.PRODUCTS_TABLE,
      Key: {
        id: productId,
      },
    };

    const stockParams = {
      TableName: process.env.STOCKS_TABLE,
      Key: {
        product_id: productId,
      },
    };

    const [productData, stockData] = await Promise.all([
      dynamodb.get(productParams).promise(),
      dynamodb.get(stockParams).promise(),
    ]);

    if (!productData.Item || !stockData.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Product not found" }),
      };
    }

    const productWithStock = {
      ...productData.Item,
      count: stockData.Item ? stockData.Item.count : 0,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(productWithStock),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error fetching product", error }),
    };
  }
};
