import { AWSError } from "aws-sdk";
import { ApiGw, DocClient } from "../config/instances";

export async function postToConnection(
  connectionId: string,
  messageBody: string
): Promise<boolean> {
  try {
    await ApiGw.postToConnection({
      ConnectionId: connectionId,
      Data: messageBody,
    }).promise();

    return true;
  } catch (error) {
    console.log("Error in postToConnection - - - >", error);

    if ((error as AWSError).statusCode === 410) {
      await DocClient.delete({
        TableName: process.env.CLIENTS_TABLE as string,
        Key: {
          connectionId: connectionId,
        },
      }).promise();

      return false;
    } else {
      throw error;
    }
  }
}
