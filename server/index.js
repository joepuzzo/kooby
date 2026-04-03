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
const kooby = new Kooby(wss);
global.myapp = {};
global.myapp.kooby = kooby;

// Health endpoint
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

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

/** Demo paginated people list for People.jsx + people_get tool */
const PEOPLE_SEED = [
  {
    id: "1",
    name: "Avery Chen",
    title: "Engineering Lead",
    email: "avery@example.com",
  },
  {
    id: "2",
    name: "Jordan Mills",
    title: "Product Designer",
    email: "jordan@example.com",
  },
  {
    id: "3",
    name: "Sam Rivera",
    title: "Developer Relations",
    email: "sam@example.com",
  },
  {
    id: "4",
    name: "Riley Park",
    title: "Backend Engineer",
    email: "riley@example.com",
  },
  {
    id: "5",
    name: "Casey Wu",
    title: "Frontend Engineer",
    email: "casey@example.com",
  },
  {
    id: "6",
    name: "Morgan Lee",
    title: "People Ops",
    email: "morgan@example.com",
  },
  {
    id: "7",
    name: "Quinn Foster",
    title: "Security",
    email: "quinn@example.com",
  },
  {
    id: "8",
    name: "Sky Patel",
    title: "Data Science",
    email: "sky@example.com",
  },
  {
    id: "9",
    name: "Drew Okonkwo",
    title: "Support Lead",
    email: "drew@example.com",
  },
  {
    id: "10",
    name: "Jamie Ortiz",
    title: "Marketing",
    email: "jamie@example.com",
  },
  { id: "11", name: "Taylor Kim", title: "Sales", email: "taylor@example.com" },
  {
    id: "12",
    name: "Reese Adams",
    title: "Finance",
    email: "reese@example.com",
  },
];

app.get("/api/people", (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page || "1"), 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(String(req.query.limit || "5"), 10) || 5),
  );
  const total = PEOPLE_SEED.length;
  const start = (page - 1) * limit;
  const people = PEOPLE_SEED.slice(start, start + limit);
  const hasMore = start + people.length < total;

  logger.info("Getting people list", {
    page,
    limit,
    total,
    hasMore,
  });

  res.json({
    people,
    page,
    limit,
    total,
    hasMore,
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
