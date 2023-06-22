import { getAllClients } from "./getAllClients";
import { postToConnection } from "./postToConnection";

export async function notifyClients(connectionIdToExclude: string) {
  const clients = await getAllClients();

  await Promise.all(
    clients
      .filter((client) => client.connectionId !== connectionIdToExclude)
      .map(async (client) => {
        await postToConnection(client.connectionId, JSON.stringify(clients));
      })
  );
}
