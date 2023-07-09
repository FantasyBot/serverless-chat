import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DocClient } from "../../config/instances";
import { GetMessagesBody } from "../../config/types";
import { postToConnection } from "../../utils/postToConnection";
import { getClient } from "../../utils/getClient";

// {"action":"getMessages","targetNickname":"gura","limit":"50"}

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const routeKey = event.requestContext.routeKey as string;
    const connectionId = event.requestContext.connectionId as string;

    if (routeKey !== "getMessages") {
      throw {
        code: 403,
        message: "WrongConnectionRoute",
      };
    }
    const parsedGetMessagesBody = JSON.parse(
      event.body || "{}"
    ) as GetMessagesBody;

    if (
      !parsedGetMessagesBody ||
      !parsedGetMessagesBody.targetNickname ||
      !parsedGetMessagesBody.limit
    ) {
      throw {
        code: 400,
        message: "InvalidGetMessageBody",
      };
    }
    const client = await getClient(connectionId);

    const output = await DocClient.query({
      TableName: process.env.MESSAGES_TABLE as string,
      IndexName: "NicknameToNicknameIndex",
      KeyConditionExpression: "#nicknameToNickname = :nicknameToNickname",
      ExpressionAttributeNames: {
        "#nicknameToNickname": "nicknameToNickname",
      },
      ExpressionAttributeValues: {
        ":nicknameToNickname": [
          client.nickname,
          parsedGetMessagesBody.targetNickname,
        ]
          .sort()
          .join("#"),
      },
      Limit: parsedGetMessagesBody.limit,
      ExclusiveStartKey: parsedGetMessagesBody.startKey,
      ScanIndexForward: false,
    }).promise();

    await postToConnection(
      connectionId,
      JSON.stringify({
        type: "messages",
        value: {
          messages: output.Items && output.Items.length > 0 ? output.Items : [],
          lastEvaluatedKey: output.LastEvaluatedKey,
        },
      })
    );

    return {
      statusCode: 200,
      body: "",
    };
  } catch (error) {
    console.log(" Error in GetMessages - >", error);

    return {
      statusCode: error.code,
      body: JSON.stringify({
        message: error.message,
      }),
    };
  }
}
