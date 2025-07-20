import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});



// store online users in memory
const userSocketMap = {}; // {userId: [socketId,socketId]}

io.on("connection", (socket) => {

  const userId = socket.handshake.query.userId;

  if (!userId) {
    console.log("Socket connection missing userId");
    return;
  }
    // userSocketMap[userId] = socket.id;
    // if (!userSocketMap[userId]) {
    //   userSocketMap[userId] = [];
    // }
    // userSocketMap[userId].push(socket.id);
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = [];
    }
    if (!userSocketMap[userId].includes(socket.id)) {
      userSocketMap[userId].push(socket.id);
    }
 

  // send events to all the  current online users to the newly connected user
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => { 
    if (!userId) {
    console.log("Socket connection missing userId");
    return;
  }
    console.log("User disconnected:", socket.id);

    if (userSocketMap[userId]) {
      userSocketMap[userId] = userSocketMap[userId].filter((id) => id !== socket.id);
      if (userSocketMap[userId].length === 0) {
        delete userSocketMap[userId];
      }
    }
    // send events to all the current online users to the newly disconnected user
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export const getReceiveSocketIds = (userId) => {
  return userSocketMap[userId] || [];
}

export { io, app, server };
