require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const express = require("express");
const { instrument } = require("@socket.io/admin-ui");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const TelegramAPI = require("node-telegram-bot-api");
const decrypted = require("./helpers");
const app = express();
const bot = new TelegramAPI(process.env.TOKEN_API, { polling: true });

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const contactIO = io.of("contact");

async function start() {
  try {
    bot.on("message", (message) => {
      const userId = message.reply_to_message?.text?.split(" ")[2];

      if (userId) {
        contactIO.to(userId).emit("receive_message", {
          message: message.text,
          id: uuidv4(),
        });
      }
    });

    contactIO.on("connection", (socket) => {
      let socketRoom = "";
      socket.on("join_room", (data) => {
        socketRoom = decrypted(data);
        socket.join(socketRoom);
      });

      socket.on("send_message", async (data) => {
        bot.sendMessage(
          process.env.CHAT_ID,
          `💬 User ${socketRoom} send message : ${data.message}`
        );
      });
    });

    server.listen(process.env.PORT, () => {
      console.log(`SERVER IS RUNNING ON PORT ${process.env.PORT}`);
    });
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}

start();
instrument(io, { auth: false });
