import dotenv from "dotenv";
import express from "express";
import http from "http";
import proxy from "./middleware/proxy.js";
import { Kooby } from "./kooby.js";
import { WebSocketServer } from "ws";
import logger from "./logger.js";

/* -------------------- Express Server -------------------- */

const app = express();

app.use(express.json());

// Create server
const server = http.createServer(app);

// Create a WebSocket server with a namespace kooby
const wss = new WebSocketServer({ server, path: "/kooby" });

// Initialize Kooby for WebSocket
new Kooby(wss);

// Health endpoint
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Route to dev server when developing (only development for now / no deployment)
app.use("/*", (req, res, next) => {
  // Remove query parameters from the URL
  const urlWithoutQuery = req.originalUrl.split("?")[0];
  req.url = urlWithoutQuery;
  req.originalUrl = urlWithoutQuery; // Ensure originalUrl is also updated
  proxy("http://localhost:9002")(req, res, next);
});

/* -------------------- Start Server -------------------- */

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  logger.info("Server is running", { port: PORT });
});
