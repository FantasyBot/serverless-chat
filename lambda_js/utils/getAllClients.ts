import DB from "aws-sdk/clients/dynamodb";
import { Client } from "../config/types";

const DocClient = new DB.DocumentClient();

export async function getAllClients(): Promise<Client[]> {
  const output = await DocClient.scan({
    TableName: process.env.CLIENTS_TABLE as string,
  }).promise();

  const clients = output.Items || [];

  return clients as Client[];
}
