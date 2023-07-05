import { DocClient } from "../config/instances";

export async function getConnectionIdByNickname(
  nickname: string
): Promise<string | undefined> {
  const output = await DocClient.query({
    TableName: process.env.CLIENTS_TABLE as string,
    IndexName: "NicknameIndex",
    KeyConditionExpression: "#nickname = :nickname",
    ExpressionAttributeNames: {
      "#nickname": "nickname",
    },
    ExpressionAttributeValues: {
      ":nickname": nickname,
    },
  }).promise();

  return output.Items && output.Items.length > 0
    ? output.Items[0].connectionId
    : undefined;
}
