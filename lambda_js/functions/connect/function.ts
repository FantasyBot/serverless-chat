import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyEventQueryStringParameters,
} from "aws-lambda";
import { notifyClients } from "../../utils/notifyClients";
import { DocClient } from "../../config/instances";
import { getConnectionIdByNickname } from "../../utils/getConnectionIdByNickname";
import { postToConnection } from "../../utils/postToConnection";

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

    const existingConnectionId = await getConnectionIdByNickname(
      queryParams["nickname"]
    );

    if (
      existingConnectionId &&
      (await postToConnection(
        existingConnectionId,
        JSON.stringify({ type: "ping" })
      ))
    ) {
      return {
        statusCode: 403,
        body: "",
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
      body: "Connected",
    };
  } catch (error) {
    console.log(" Error in connect lamda - >", error);

    return {
      statusCode: error.code,
      body:
        "Failed to connect: " +
        JSON.stringify({
          message: error.message,
        }),
    };
  }
}
