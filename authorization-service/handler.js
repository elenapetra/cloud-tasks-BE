module.exports.basicAuthorizer = async (event, _, callback) => {
  if (event["type"] != "TOKEN") {
    callback("Unauthorized");
  }

  try {
    const authorizationToken = event.authorizationToken;
    const encodedCreds = authorizationToken.split(" ")[1];
    const buff = Buffer.from(encodedCreds, "base64");
    const [username, password] = buff.toString("utf-8").split(":");

    const storedUserPassword = process.env.elenapetra;
    const usernameExists = !!process.env[username];

    const effect =
      usernameExists && (!storedUserPassword || storedUserPassword !== password)
        ? "Deny"
        : "Allow";

    const policy = generatePolicy(encodedCreds, event.methodArn, effect);

    callback(null, policy);
  } catch (error) {
    callback(`Unauthorized: ${error.message}`);
  }
};

const generatePolicy = (principalId, resource, effect = "Allow") => {
  return {
    principalId: principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
};
