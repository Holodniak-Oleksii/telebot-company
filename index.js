const express = require("express");
require("dotenv").config();
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const TelegramAPI = require("node-telegram-bot-api");
const bot = new TelegramAPI(process.env.TOKEN_API, { polling: true });

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

bot.on("message", (message) => {
  const userId = message.reply_to_message?.text?.split(" ")[3];
  if (userId) {
    io.to(userId).emit("receive_message", {
      message: message.text,
      id: message.message_id,
    });
  }
});

io.on("connection", (socket) => {
  socket.on("join_room", (data) => {
    socket.join(socket.id);
  });

  socket.on("send_message", async (data) => {
    bot.sendMessage(
      process.env.CHAT_ID,
      `Повідомлення від користувача ${socket.id} \n Текст: ${data.message}`
    );
  });
});

server.listen(process.env.PORT, () => {
  console.log("SERVER IS RUNNING");
});
