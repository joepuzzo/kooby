import dotenv from "dotenv";
import express from "express";
import http from "http";
import proxy from "./middleware/proxy.js";
import { Kooby } from "./kooby.js";
import { WebSocketServer } from "ws";
import logger from "./logger.js";
import people from "./routes/people.js";

/* -------------------- Express Server -------------------- */

const app = express();

app.use(express.json());

// Create server
const server = http.createServer(app);

// Create a WebSocket server with a namespace kooby
const wss = new WebSocketServer({ server, path: "/kooby" });

// Initialize Kooby for WebSocket
const kooby = new Kooby(wss);
global.myapp = {};
global.myapp.kooby = kooby;

// Health endpoint
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use("/api/people", people);

// Example endpoint to get conversation history
app.get("/api/convo/:id", async (req, res) => {
  logger.info("Getting conversation history for socketId", {
    id: req.params.id,
  });
  const socketId = req.params.id;
  const kooby = global.myapp?.kooby;
  if (!kooby) {
    res.status(503).json({ error: "Kooby service not ready" });
    return;
  }

  const conversationHistory = await kooby.getConversationHistory(socketId);
  if (!conversationHistory) {
    res.status(404).json({ error: "Conversation not found", socketId });
    return;
  }

  res.json({
    socketId,
    conversationHistory,
  });
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
