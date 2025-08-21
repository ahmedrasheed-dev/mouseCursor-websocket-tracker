import { WebSocketServer } from "ws";
import http from "http";
const server = http.createServer();
const wss = new WebSocketServer({ server });
import { randomUUID } from "crypto";

let rooms = new Map();
function broadcastToRoom(roomId, senderId, message, includeSender = false) {
  if (!rooms.has(roomId)) return;
  for (const [clientId, clientData] of rooms.get(roomId)) {
    if (
      (!includeSender && clientId === senderId) ||
      clientData.ws.readyState !== clientData.ws.OPEN
    ) {
      continue;
    }
    clientData.ws.send(JSON.stringify(message));
  }
}

wss.on("connection", (ws) => {
  const userId = randomUUID();
  console.log(`New client connected: ${userId}`);
  let currentRoomId = null;

  ws.on("message", (message) => {
    const parsed = JSON.parse(message.toString());
    switch (parsed.type) {
      case "join":
        // currentRoomId = parsed.roomId;
        currentRoomId = 1;
        if (!rooms.has(currentRoomId)) {
          //   currentRoomId = randomUUID();
          rooms.set(currentRoomId, new Map());
        }
        rooms.get(currentRoomId).set(userId, { ws, x: 0, y: 0 });
        console.log(`User ${userId} joined room ${currentRoomId}`);
        broadcastToRoom(currentRoomId, userId, {
          message: `User ${userId} joined room`,
        });
        break;

      case "move":
        if (!currentRoomId || !rooms.has(currentRoomId)) break;
        const x = Number(parsed.x);
        const y = Number(parsed.y);
        // currentRoomId = parsed.roomId;
        currentRoomId = 1;
        const room = rooms.get(currentRoomId);
        room.set(userId, { ...room.get(userId), x, y });
        broadcastToRoom(currentRoomId, userId, { type: "move", userId, x, y });
        break;

      case "leave":
        // currentRoomId = parsed.roomId;
        currentRoomId = 1;
        rooms.get(currentRoomId).delete(userId);
        broadcastToRoom(currentRoomId, userId, {
          message: `User ${userId} left`,
        });
        if (rooms.get(currentRoomId).size === 0) {
          rooms.delete(currentRoomId);
        }
        break;
      default:
        console.log("Unknown message type:", parsed.type);
        break;
    }
  });

  ws.on("close", () => {
    if (currentRoomId && rooms.has(currentRoomId)) {
      rooms.get(currentRoomId).delete(userId);
      broadcastToRoom(currentRoomId, userId, {
        message: { message: `User ${userId} disconnected` },
      });
    }
  });
});
const PORT = 3000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
