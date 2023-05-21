import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyEventQueryStringParameters,
} from "aws-lambda";
import AWS from "aws-sdk/clients/dynamodb";

const DocClient = new AWS.DocumentClient();

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const routeKey = event.requestContext.routeKey as string;
    const connectionId = event.requestContext.connectionId as string;
    const queryParams =
      event.queryStringParameters as APIGatewayProxyEventQueryStringParameters | null;

    if (routeKey !== "$connect") {
      throw new Error("WrongConnectionRoute");
    }

    if (!queryParams || !queryParams["nickname"]) {
      throw new Error("NicknameNotProvided");
    }

    await DocClient.put({
      TableName: process.env.CLIENTS_TABLE as string,
      Item: {
        connectionId,
        nickname: queryParams["nickname"],
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
