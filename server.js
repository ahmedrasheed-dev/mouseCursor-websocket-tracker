import { WebSocketServer } from "ws";
import http from "http";
const server = http.createServer();
const wss = new WebSocketServer({ server });
import { randomUUID } from "crypto";

let clients = new Map();

wss.on("connection", (ws) => {
  const id = randomUUID();
  console.log(`New client connected: ${id}`);
  clients.set(id, ws);
  ws.on("message", (message) => {
    if (message.toString() === "ping") {
      console.log("Got ping from", id);
      for (const [clientId, client] of clients) {
        if (clientId !== id) {
          client.send(`Ping from ${id}`);
        }
      }
      return;
    }
    for (const [clientId, client] of clients) {
      if (clientId !== id) {
        client.send(`User ${id} sendt message: ${message}`);
      }
    }
  });

  ws.on("close", () => {
    delete clients[ws.id];
  });
});
const PORT = 3000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
