import APIGW from "aws-sdk/clients/apigatewaymanagementapi";
import DB from "aws-sdk/clients/dynamodb";

export const ApiGw = new APIGW({
  endpoint: process.env.WSSAPIGATEWAYENDPOINT,
});

export const DocClient = new DB.DocumentClient();
