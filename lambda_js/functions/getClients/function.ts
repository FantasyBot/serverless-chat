import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getAllClients } from "../../utils/getAllClients";
import { postToConnection } from "../../utils/postToConnection";

// {"action":"getClients"}

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const routeKey = event.requestContext.routeKey as string;
    const connectionId = event.requestContext.connectionId as string;

    if (routeKey !== "getClients") {
      throw {
        code: 403,
        message: "WrongConnectionRoute",
      };
    }

    await postToConnection(
      connectionId,
      JSON.stringify({
        type: "clients",
        value: await getAllClients(),
      })
    );

    return {
      statusCode: 200,
      body: "success",
    };
  } catch (error) {
    console.log("Error in getClients  - - > ", error);

    return {
      statusCode: error.code,
      body: JSON.stringify({
        message: error.message,
      }),
    };
  }
}
