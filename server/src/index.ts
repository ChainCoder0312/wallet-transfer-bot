import "dotenv/config";
import * as express from "express";
import routers from "./routes";
import * as cors from "cors";
import * as compression from "compression";
import { Server } from "socket.io";
import { Bot } from './bot/bot';
const config = require("../config");

const { PORT } = config;
const app = express();
const bot = new Bot();

app.use(express.json());
app.use(compression());
app.use(express.static(`${config.DIR}/public`));



app.use(
  cors({
    origin: "*", // Allow only your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"], // Add other methods if needed
    credentials: true, // If you want to allow credentials (cookies, authorization headers, etc.)
  })
);

// Routes
app.use("/api", routers(bot));

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
const io = require("socket.io")(server, { cors: { origin: "*" } });


io.on('connection', (socket: Server) => {
  bot.onServer(socket);
  console.log('Socket connected');
  socket.on('disconnect', () => {
    bot.onServer(null);
    console.log('Socket disconnected');
  });
});


