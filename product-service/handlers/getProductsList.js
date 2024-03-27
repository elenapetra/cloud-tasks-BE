const AWS = require("aws-sdk");

AWS.config.update({ region: "eu-west-1" });
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.getProductsList = async () => {
  try {
    const productsParams = {
      TableName: process.env.PRODUCTS_TABLE,
    };

    const stocksParams = {
      TableName: process.env.STOCKS_TABLE,
    };

    const [productsData, stocksData] = await Promise.all([
      dynamodb.scan(productsParams).promise(),
      dynamodb.scan(stocksParams).promise(),
    ]);

    const productsWithStocks = productsData.Items.map((product) => {
      const stockInfo = stocksData.Items.find(
        (item) => item.product_id === product.id
      );
      return {
        ...product,
        count: stockInfo ? stockInfo.count : 0,
      };
    });
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productsWithStocks),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error fetching products", error }),
    };
  }
};
