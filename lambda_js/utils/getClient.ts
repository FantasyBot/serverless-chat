import { DocClient } from "../config/instances";
import { Client } from "../config/types";

export async function getClient(connectionId: string) {
  const output = await DocClient.get({
    TableName: process.env.CLIENTS_TABLE as string,
    Key: {
      connectionId,
    },
  }).promise();

  if (!output.Item) {
    throw {
      code: 404,
      message: "ClientNotExists",
    };
  }

  return output.Item as Client;
}
