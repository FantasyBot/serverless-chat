import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DocClient } from "../../config/instances";
import { v4 } from "uuid";
import { getConnectionIdByNickname } from "../../utils/getConnectionIdByNickname";
import { SendMessageBody } from "../../config/types";
import { getClient } from "../../utils/getClient";
import { postToConnection } from "../../utils/postToConnection";

// {"action":"sendMessage","message":"Hello","recipientNickname":"gura"}

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const routeKey = event.requestContext.routeKey as string;
    const connectionId = event.requestContext.connectionId as string;

    if (routeKey !== "sendMessage") {
      throw {
        code: 403,
        message: "WrongConnectionRoute",
      };
    }

    const parsedSendMessageBody = JSON.parse(
      event.body || "{}"
    ) as SendMessageBody;

    if (
      !parsedSendMessageBody ||
      !parsedSendMessageBody.recipientNickname ||
      !parsedSendMessageBody.message
    ) {
      throw {
        code: 400,
        message: "InvalidSendMessageBody",
      };
    }

    const client = await getClient(connectionId);

    const nicknameToNickname = [
      client.nickname,
      parsedSendMessageBody.recipientNickname,
    ]
      .sort()
      .join("#");

    const recipientConnectionId = await getConnectionIdByNickname(
      parsedSendMessageBody.recipientNickname
    );

    if (!recipientConnectionId) {
      await postToConnection(
        connectionId,
        JSON.stringify({ type: "error", message: "WrongNickname" })
      );

      return {
        statusCode: 200,
        body: "",
      };
    }

    await DocClient.put({
      TableName: process.env.MESSAGES_TABLE as string,
      Item: {
        messageId: v4(),
        nicknameToNickname,
        message: parsedSendMessageBody.message,
        sender: client.nickname,
        createdAt: new Date().getTime(),
      },
    }).promise();

    if (recipientConnectionId) {
      await postToConnection(
        recipientConnectionId,
        JSON.stringify({
          type: "message",
          value: {
            sender: client.nickname,
            message: parsedSendMessageBody.message,
          },
        })
      );
    }

    return {
      statusCode: 200,
      body: "",
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
