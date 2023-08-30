require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const express = require("express");
const { instrument } = require("@socket.io/admin-ui");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const TelegramAPI = require("node-telegram-bot-api");

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
      const userId = message.reply_to_message?.text?.split(" ")[5];

      if (userId) {
        contactIO.to(userId).emit("receive_message", {
          message: message.text,
          id: uuidv4(),
        });
      }
    });

    contactIO.on("connection", (socket) => {
      socket.on("join_room", (data) => {
        socket.join(data);
      });

      socket.on("send_message", async (data) => {
        bot.sendMessage(
          process.env.CHAT_ID,
          `💬 Message from the user ${data.room} : ${data.message}`
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
