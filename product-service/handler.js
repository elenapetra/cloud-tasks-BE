const products = require("./src/services/products-data.json");
const AWS = require("aws-sdk");

AWS.config.update({ region: "eu-west-1" });

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.getProductsList = async () => {
  try {
    const productsParams = {
      TableName: process.env.PRODUCTS_TABLE,
    };

    const productsData = await dynamodb.scan(productsParams).promise();

    const stocksParams = {
      TableName: process.env.STOCKS_TABLE,
    };

    const stocksData = await dynamodb.scan(stocksParams).promise();

    const productsWithStocks = productsData.Items.map((product) => {
      console.log("product:", product);
      const stockInfo = stocksData.Items.find((stock) => {
        console.log("stock: ", stock);
        return stock.product_id === product.id;
      });

      return {
        ...product,
        count: stockInfo.count ? stockInfo.count : 0,
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

module.exports.getProductById = async (event) => {
  const productId = event.pathParameters.productId;

  try {
    const productParams = {
      TableName: process.env.PRODUCTS_TABLE,
      Key: {
        id: productId,
      },
    };

    const productData = await dynamodb.get(productParams).promise();

    if (!productData.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Product not found" }),
      };
    }

    const stockParams = {
      TableName: process.env.STOCKS_TABLE,
      Key: {
        product_id: productId,
      },
    };

    const stockData = await dynamodb.get(stockParams).promise();

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
