const crypto = require("crypto");

function generateUniqueId() {
  const buffer = crypto.randomBytes(16);
  let uniqueId = buffer.toString("hex");
  uniqueId =
    uniqueId.slice(0, 8) +
    "-" +
    uniqueId.slice(8, 12) +
    "-" +
    uniqueId.slice(12, 16) +
    "-" +
    uniqueId.slice(16, 20) +
    "-" +
    uniqueId.slice(20);

  return uniqueId;
}
module.exports = generateUniqueId;
