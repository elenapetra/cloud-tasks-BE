const AWS = require("aws-sdk");
const generateUniqueId = require("./src/utils/generateUniqueId");

AWS.config.update({ region: process.env.REGION });
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
        count: stockInfo?.count ?? 0,
      };
    });
    return {
      statusCode: 200,
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
        ...productParams.Item,
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
