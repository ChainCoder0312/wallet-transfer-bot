"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express = require("express");
const routes_1 = require("./routes");
const cors = require("cors");
const compression = require("compression");
const bot_1 = require("./bot/bot");
const config = require("../config");
const { PORT } = config;
const app = express();
const bot = new bot_1.Bot();
app.use(express.json());
app.use(compression());
app.use(express.static(`${config.DIR}/public`));
console.log(config.DIR);
app.use(cors({
    origin: "*", // Allow only your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"], // Add other methods if needed
    credentials: true, // If you want to allow credentials (cookies, authorization headers, etc.)
}));
// Routes
app.use("/api", (0, routes_1.default)(bot));
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
const io = require("socket.io")(server, { cors: { origin: "*" } });
io.on('connection', (socket) => {
    bot.onServer(socket);
    console.log('Socket connected');
    socket.on('disconnect', () => {
        bot.onServer(null);
        console.log('Socket disconnected');
    });
    socket.on("start", () => {
        bot.start();
    });
    socket.on("stop", () => {
        bot.stop();
    });
    setInterval(() => {
        io.emit("status", bot.status);
    }, 500);
});
