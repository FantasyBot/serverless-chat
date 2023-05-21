import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk/clients/dynamodb";

const DocClient = new AWS.DocumentClient();

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const routeKey = event.requestContext.routeKey as string;
    const connectionId = event.requestContext.connectionId as string;

    if (routeKey !== "$disconnect") {
      throw new Error("WrongConnectionRoute");
    }

    await DocClient.delete({
      TableName: process.env.CLIENTS_TABLE as string,
      Key: {
        connectionId,
      },
    }).promise();

    return {
      statusCode: 200,
      body: "success",
    };
  } catch (error) {
    return {
      statusCode: error.code,
      body: JSON.stringify({
        message: error.message,
      }),
    };
  }
}
