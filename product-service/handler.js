"use strict";
const products = require("./src/services/products-data.json");

module.exports.getProductsList = () => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(products),
  };
};

module.exports.getProductById = (event) => {
  const productId = event.pathParameters.productId;
  const product = products.find((p) => p.id.toString() === productId);

  if (!product) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Product not found" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(product),
  };
};
