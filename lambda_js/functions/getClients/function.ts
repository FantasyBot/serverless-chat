import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getAllClients } from "../../utils/getAllClients";
import { postToConnection } from "../../utils/postToConnection";

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

    const clients = await getAllClients();

    await postToConnection(connectionId, JSON.stringify(clients));

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
