import { WebSocketServer } from "ws";
import http from "http";
const server = http.createServer();
const wss = new WebSocketServer({ server });
import { randomUUID } from "crypto";

let clients = new Map();

wss.on("connection", (ws) => {
  const id = randomUUID();
  console.log(`New client connected: ${id}`);
  clients.set(id, { ws, x: 0, y: 0 });

  ws.on("message", (message) => {
    // if (message.toString().message === "ping") {
    //   console.log("Got ping from", id);
    //   for (const [clientId, client] of clients) {
    //     if (clientId !== id) {
    //       client.send(`Ping from ${id}`);
    //     }
    //   }
    //   return;
    // }
    const parsed = JSON.parse(message);
    // Ensure numbers
    const x = Number(parsed.x);
    const y = Number(parsed.y);
    clients.set(id, { ...clients.get(id), x, y });

    //this is broadcasting
    for (const [clientId, clientData] of clients) {
      const client = clientData.ws;
      if (clientId !== id && client.readyState === 1) {
        client.send(`User ${id} cords: ${x}, ${y}`);
      }
    }
  });

  ws.on("close", () => {
    delete clients.delete(id);
  });
});
const PORT = 3000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
