import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import AuthRoutes from "./routes/Auth.js";
import MessageRoutes from "./routes/Messages.js";
import MessageModel from "./models/Messages.js";
import PendingMessageModel from "./models/pendingMessages.js";
import UserModel from "./models/Auth.js";
import DbCon from "./db/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const app = express();

DbCon();

app.use(express.json());
app.use(express.static("public"));
app.use(cors());

app.use("/api/Auth", AuthRoutes);
app.use("/api/messages", MessageRoutes);

if (NODE_ENV === "production") {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "./Frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "./Frontend/dist", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let users = [];

const addUser = (userId, socketId) => {
  if (!userId) return;
  const existingUser = users.find((user) => user.userId === userId);
  if (existingUser) {
    existingUser.socketId = socketId;
  } else {
    users.push({ userId, socketId });
  }
  console.log("Updated users list:", users);
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
  console.log("Updated users list after removal:", users);
};

const getUser = (userId) => users.find((user) => user.userId === userId);

io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  socket.on("AddUserSocket", async (userId) => {
    console.log(`User connected: ${userId}`);
    addUser(userId, socket.id);
    io.emit("getUsers", users);

    await UserModel.findByIdAndUpdate(userId, { isOnline: true });

    try {
      const pendingMessages = await PendingMessageModel.findOne({ receiverId: userId }).populate("messages");

      if (pendingMessages && pendingMessages.messages.length > 0) {
        console.log(`Delivering ${pendingMessages.messages.length} pending messages to ${userId}`);

        pendingMessages.messages.forEach((msg) => {
          io.to(socket.id).emit("receiveMessage", {
            senderId: msg.senderId,
            message: msg.message,
            time: msg.time,
          });
        });

        await PendingMessageModel.findByIdAndDelete(pendingMessages._id);
      }
    } catch (error) {
      console.error("Error fetching pending messages:", error.message);
    }
  });

  socket.on("sendMessage", async (data, callback) => {
    console.log("Received message data:", JSON.stringify(data, null, 2));

    if (!data || !data.senderId || !data.receiverId || !data.message || !data.time) {
      console.error("Invalid message data:", data);
      if (callback) callback({ success: false, error: "Invalid message format." });
      return;
    }

    const { senderId, receiverId, message, time } = data;
    const receiver = getUser(receiverId);

    try {
      const newMessage = new MessageModel({
        senderId,
        receiverId,
        message,
        time,
        delivered: receiver ? true : false,
      });

      await newMessage.save();

      if (receiver?.socketId) {
        io.to(receiver.socketId).emit("receiveMessage", { senderId, message, time });
        console.log(`Message delivered to ${receiverId}`);
      } else {
        console.log("Receiver is offline. Storing message in PendingMessageModel.");

        let pendingMessages = await PendingMessageModel.findOne({ receiverId });

        if (!pendingMessages) {
          pendingMessages = new PendingMessageModel({ receiverId, messages: [] });
        }

        pendingMessages.messages.push(newMessage);
        await pendingMessages.save();
      }

      if (callback) callback({ success: true });
    } catch (error) {
      console.error("Error saving message:", error.message);
      if (callback) callback({ success: false, error: "Message could not be sent." });
    }
  });

  socket.on("disconnect", async () => {
    console.log(`A user disconnected: ${socket.id}`);
    const disconnectedUser = users.find((user) => user.socketId === socket.id);
    removeUser(socket.id);
    io.emit("getUsers", users);

    if (disconnectedUser) {
      await UserModel.findByIdAndUpdate(disconnectedUser.userId, { isOnline: false });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode`);
});
