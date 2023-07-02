import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { notifyClients } from "../../utils/notifyClients";
import { DocClient } from "../../config/instances";

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const routeKey = event.requestContext.routeKey as string;
    const connectionId = event.requestContext.connectionId as string;

    if (routeKey !== "$disconnect") {
      throw {
        code: 403,
        message: "WrongConnectionRoute",
      };
    }

    await DocClient.delete({
      TableName: process.env.CLIENTS_TABLE as string,
      Key: {
        connectionId,
      },
    }).promise();

    await notifyClients(connectionId);

    return {
      statusCode: 200,
      body: "Disconnected",
    };
  } catch (error) {
    console.log("Error in disconnect - - - >", error);

    return {
      statusCode: error.code,
      body:
        "Failed to disconnect:" +
        JSON.stringify({
          message: error.message,
        }),
    };
  }
}
