import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ApiGw, DocClient } from "../../config/instances";

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const routeKey = event.requestContext.routeKey as string;

    if (routeKey !== "sendMessage") {
      throw {
        code: 403,
        message: "WrongConnectionRoute",
      };
    }

    let connectionData;

    try {
      connectionData = await DocClient.scan({
        TableName: process.env.CLIENTS_TABLE as string,
        ProjectionExpression: "connectionId",
      }).promise();
    } catch (e) {
      return { statusCode: 500, body: e.stack };
    }

    const postData = JSON.parse(event.body as any).data;

    const postCalls = connectionData.Items.map(async ({ connectionId }) => {
      try {
        await ApiGw.postToConnection({
          ConnectionId: connectionId,
          Data: postData,
        }).promise();
      } catch (e) {
        if (e.statusCode === 410) {
          console.log(`Found stale connection, deleting ${connectionId}`);
          await DocClient.delete({
            TableName: process.env.CLIENTS_TABLE as string,
            Key: { connectionId },
          }).promise();
        } else {
          throw e;
        }
      }
    });

    try {
      await Promise.all(postCalls);
    } catch (e) {
      return { statusCode: 500, body: e.stack };
    }

    return {
      statusCode: 200,
      body: "Data sent",
    };
  } catch (error) {
    console.log(" Error in SendMessage - >", error);

    return {
      statusCode: error.code,
      body: JSON.stringify({
        message: error.message,
      }),
    };
  }
}
