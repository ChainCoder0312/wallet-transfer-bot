import "dotenv/config";
import * as express from "express";
import routers from "./routes";
import * as cors from "cors";
// import { initServer } from "./controllers/crash";
// import { initSlider } from "./controllers/slide";
// import { initHilo } from "./controllers/hilo_m";
// import { initBaccarat } from "./controllers/baccarat";

// const ioGames = [initServer, initSlider, initBaccarat, initHilo];

import * as compression from "compression";
const config = require("../config");

const { PORT } = config;
const app = express();

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
app.use("/api", routers);

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
const io = require("socket.io")(server, { cors: { origin: "*" } });

// ioGames.forEach((g) => g(io));
