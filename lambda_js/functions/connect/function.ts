import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyEventQueryStringParameters,
} from "aws-lambda";
import { notifyClients } from "../../utils/notifyClients";
import { DocClient } from "../../config/instances";

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const routeKey = event.requestContext.routeKey as string;
    const connectionId = event.requestContext.connectionId as string;
    const queryParams =
      event.queryStringParameters as APIGatewayProxyEventQueryStringParameters | null;

    if (routeKey !== "$connect") {
      throw {
        code: 403,
        message: "WrongConnectionRoute",
      };
    }

    if (!queryParams || !queryParams["nickname"]) {
      throw {
        code: 403,
        message: "NicknameNotProvided",
      };
    }

    await DocClient.put({
      TableName: process.env.CLIENTS_TABLE as string,
      Item: {
        connectionId,
        nickname: queryParams["nickname"],
      },
    }).promise();

    await notifyClients(connectionId);

    return {
      statusCode: 200,
      body: "success",
    };
  } catch (error) {
    console.log(" Error - >", error);

    return {
      statusCode: error.code,
      body: JSON.stringify({
        message: error.message,
      }),
    };
  }
}
