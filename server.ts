import { createServer } from "https";
import next from "next";
import { Server } from "socket.io";
import { networkInterfaces } from "os";
import mdns from "multicast-dns";
import selfsigned from "selfsigned";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "443", 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Get local IP
function getLocalIp() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1)
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
      if (net.family === familyV4Value && !net.internal) {
        return net.address;
      }
    }
  }
  return "127.0.0.1";
}

app.prepare().then(async () => {
  console.log("> Generating self-signed SSL certificate...");
  const attrs = [{ name: 'commonName', value: 'lanshare.local' }];
  const pems = await selfsigned.generate(attrs);

  const httpServer = createServer({
    key: pems.private,
    cert: pems.cert
  }, handle);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const rooms = new Map();
  const localIp = getLocalIp();

  // Setup mDNS responder for zero-config networking
  try {
    const m = mdns();
    m.on('query', (query) => {
      const hasLanshareQuestion = query.questions.some(
        q => q.name.toLowerCase() === 'lanshare.local' && q.type === 'A'
      );
      if (hasLanshareQuestion) {
        m.respond({
          answers: [{
            name: 'lanshare.local',
            type: 'A',
            ttl: 120,
            data: localIp
          }]
        });
      }
    });
  } catch (err) {
    console.error("Failed to start mDNS responder:", err);
  }

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("create-room", ({ roomId, pin }) => {
      rooms.set(roomId, { host: socket.id, viewers: new Set(), pin });
      socket.join(roomId);
      console.log(`Room ${roomId} created by ${socket.id} with pin ${pin ? 'yes' : 'no'}`);
      socket.emit("room-created", { roomId, lanIp: localIp, localDomain: "lanshare.local", port, hasPin: !!pin });
    });

    socket.on("join-room", ({ roomId, pin }) => {
      const room = rooms.get(roomId);
      if (room) {
        if (room.pin && room.pin !== pin) {
          socket.emit("error", { message: "Invalid PIN" });
          return;
        }
        room.viewers.add(socket.id);
        socket.join(roomId);
        console.log(`Viewer ${socket.id} joined room ${roomId}`);
        // Notify host that a viewer joined
        io.to(room.host).emit("viewer-joined", { viewerId: socket.id });
        // Send host info to the viewer
        socket.emit("room-joined", { hostId: room.host });
        // Update viewers count
        io.to(roomId).emit("viewers-count", { count: room.viewers.size });
      } else {
        socket.emit("error", { message: "Room not found or expired" });
      }
    });

    // WebRTC Signaling
    socket.on("offer", ({ target, offer }) => {
      io.to(target).emit("offer", { sender: socket.id, offer });
    });

    socket.on("answer", ({ target, answer }) => {
      io.to(target).emit("answer", { sender: socket.id, answer });
    });

    socket.on("ice-candidate", ({ target, candidate }) => {
      io.to(target).emit("ice-candidate", { sender: socket.id, candidate });
    });

    socket.on("host-quality-update", ({ roomId, quality }) => {
      socket.to(roomId).emit("quality-updated", quality);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      // Clean up rooms
      for (const [roomId, room] of rooms.entries()) {
        if (room.host === socket.id) {
          // Host disconnected
          io.to(roomId).emit("host-disconnected");
          rooms.delete(roomId);
        } else if (room.viewers.has(socket.id)) {
          // Viewer disconnected
          room.viewers.delete(socket.id);
          io.to(room.host).emit("viewer-left", { viewerId: socket.id });
          io.to(roomId).emit("viewers-count", { count: room.viewers.size });
        }
      }
    });
  });

  httpServer.listen(port, hostname, () => {
    const p = port === 443 ? '' : `:${port}`;
    console.log(`> Ready on https://localhost${p}`);
    console.log(`> Network: https://${localIp}${p}`);
    console.log(`> Domain:  https://lanshare.local${p}`);
  });
});
