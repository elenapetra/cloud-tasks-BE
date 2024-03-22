const AWS = require("aws-sdk");
const fs = require("fs");

AWS.config.update({ region: "eu-west-1" });
const dynamodb = new AWS.DynamoDB.DocumentClient();

const PRODUCTS_TABLE = "products-db";
const STOCKS_TABLE = "stocks-db";
const PRODUCTS_JSON_FILE_PATH = "./products-data.json";
const STOCKS_JSON_FILE_PATH = "./stocks-data.json";

const productsData = JSON.parse(
  fs.readFileSync(PRODUCTS_JSON_FILE_PATH, "utf8")
);
const stocksData = JSON.parse(fs.readFileSync(STOCKS_JSON_FILE_PATH, "utf8"));

async function pushProductsDataToDynamoDB() {
  try {
    for (const product of productsData) {
      const params = {
        TableName: PRODUCTS_TABLE,
        Item: product,
      };
      await dynamodb.put(params).promise();
    }
    console.log(
      "All products inserted into DynamoDB products-db table successfully."
    );
  } catch (error) {
    console.error(
      "Error inserting products into DynamoDB products-db table:",
      error
    );
  }
}

async function pushStocksDataToDynamoDB() {
  try {
    for (const stock of stocksData) {
      const params = {
        TableName: STOCKS_TABLE,
        Item: stock,
      };
      await dynamodb.put(params).promise();
    }
    console.log(
      "All stocks inserted into DynamoDB stocks-db table successfully."
    );
  } catch (error) {
    console.error(
      "Error inserting stocks into DynamoDB stocks-db table:",
      error
    );
  }
}

pushStocksDataToDynamoDB();
pushProductsDataToDynamoDB();
