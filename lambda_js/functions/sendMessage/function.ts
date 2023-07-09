import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ApiGw, DocClient } from "../../config/instances";
import { v4 } from "uuid";
import { getConnectionIdByNickname } from "../../utils/getConnectionIdByNickname";
import { SendMessageBody } from "../../config/types";
import { getClient } from "../../utils/getClient";

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

    const recipientConnectionId = await getConnectionIdByNickname(
      parsedSendMessageBody.recipientNickname
    );

    if (!recipientConnectionId) {
      console.log("_--------NorecipientConnectionId - - - -  -");

      // await ApiGw.postToConnection(
      //   connectionId,
      //   JSON.stringify({ type: "error", message: error.message })
      // );
      return {
        statusCode: 200,
        body: "WrongNickname",
      };
    }

    if (recipientConnectionId) {
      await ApiGw.postToConnection({
        ConnectionId: recipientConnectionId,
        Data: JSON.stringify({
          type: "message",
          value: {
            sender: client.nickname,
            message: parsedSendMessageBody.message,
          },
        }),
      }).promise();
    }
    return {
      statusCode: 200,
      body: "",
    };
  } catch (error) {
    console.log(" Error in SendMessage - >", error);

    // @TODO
    // if (error instanceof HandlerError) {
    //   await postToConnection(
    //     connectionId,
    //     JSON.stringify({ type: "error", message: error.message })
    //   );
    //   return {
    //     statusCode: 200,
    //     body: "Connected",
    //   };
    // }

    return {
      statusCode: error.code,
      body: JSON.stringify({
        message: error.message,
      }),
    };
  }
}
