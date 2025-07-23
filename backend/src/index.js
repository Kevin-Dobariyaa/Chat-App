import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { connectDB } from "./lib/db.js";

import authRouter from "./routes/auth.route.js";
import messageRouter from "./routes/message.route.js";
import videoRoute from "./routes/video.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV || "production";
const __dirname = path.resolve();

// app.use(express.json());
app.use(express.json({ limit: "1000mb" }));
app.use(express.urlencoded({ extended: true, limit: "1000mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: (NODE_ENV == "developement" ? "http://localhost:5173" : "https://chatty-chat-me.vercel.app"),
    credentials: true,
  })
);

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);
app.use("/api/video", videoRoute);

if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("/*splat", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  }); 
}

server.listen(PORT, () => {
  console.log(`Server is Running on port ${PORT} 🏃🏃🏃🏃🏃🏃🏃🏃🏃`);
  connectDB();
});
