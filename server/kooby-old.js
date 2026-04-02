import fs from "fs";
import { OpenAI } from "openai";
import logger from "./logger.js";

/** xAI Grok (OpenAI-compatible): https://docs.x.ai/docs/overview */
const DEFAULT_BASE_URL = "https://api.x.ai/v1";
const DEFAULT_MODEL = "grok-4-1-fast-reasoning";

function loadApiKey() {
  const fromEnv = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  if (fromEnv) {
    return fromEnv.trim();
  }
  return fs.readFileSync("token_grok.txt", "utf8").trim();
}

// Kooby class
export class Kooby {
  constructor(wss) {
    this.wss = wss;
    this.api_key = loadApiKey();
    this.client = new OpenAI({
      apiKey: this.api_key,
      baseURL: process.env.GROK_BASE_URL || DEFAULT_BASE_URL,
    });
    this.model = process.env.GROK_MODEL || DEFAULT_MODEL;
    this.INITIAL_PROMPT = fs
      .readFileSync("server/prompts/prompt1.txt", "utf8")
      .trim();
    this.conversations = {};

    // Handle WebSocket connections
    this.wss.on("connection", (ws) => {
      let socketId = null;

      ws.on("message", async (message) => {
        try {
          const data = JSON.parse(message);
          logger.info("WebSocket message received", data);

          if (data.handshake) {
            socketId = data.socketId || crypto.randomUUID();
            logger.info("WebSocket handshake", { socketId });
            this.initializeConversation(socketId, data);
          } else if (data.reset) {
            if (!socketId) return;
            this.resetConversationState(socketId);
          } else if (data.input) {
            if (!socketId) return;
            await this.handlePrompt(ws, socketId, data);
          } else if (data.context) {
            if (!socketId) return;
            await this.updateContext(socketId, data);
          }
        } catch (error) {
          logger.error("Error processing WebSocket message", { error });
        }
      });

      ws.on("close", () => {
        logger.info("WebSocket connection closed", { socketId });
        if (socketId) {
          delete this.conversations[socketId];
        }
        logger.info("Active conversations remaining", {
          count: Object.keys(this.conversations).length,
        });
      });

      ws.on("error", (error) => {
        logger.error("WebSocket error", { error, socketId });
      });
    });
  }

  async getChatCompletion(conversationHistory, ws, data) {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: conversationHistory,
      max_tokens: 4096,
      stream: true,
    });

    const outgoingTtl = Math.max(0, data.ttl - 1);

    let result = "";
    for await (const chunk of response) {
      if (chunk.choices[0].delta.content) {
        const chunkContent = chunk.choices[0].delta.content;
        result += chunkContent;
        ws.send(JSON.stringify({ output: chunkContent }));
      }
    }

    ws.send(
      JSON.stringify({
        complete: true,
        ttl: outgoingTtl,
      }),
    );

    return result;
  }

  initializeConversation(socketId, handshakeData) {
    console.log("initializeConversation", socketId, handshakeData);

    if (handshakeData.history) {
      this.conversations[socketId] = [
        { role: "system", content: this.INITIAL_PROMPT },
        ...handshakeData.history,
      ];
      return;
    }
    if (!this.conversations[socketId]) {
      this.conversations[socketId] = [
        { role: "system", content: this.INITIAL_PROMPT },
      ];
    }
  }

  resetConversationState(socketId) {
    logger.debug("Conversation reset", { socketId });
    this.conversations[socketId] = [
      { role: "system", content: this.INITIAL_PROMPT },
    ];
  }

  async handlePrompt(ws, socketId, data) {
    logger.debug("Prompt received");

    const conversation = this.conversations[socketId];
    conversation.push({ role: "user", content: data.input });

    const result = await this.getChatCompletion(conversation, ws, data);
    conversation.push({ role: "assistant", content: result });
  }

  async updateContext(socketId, data) {
    logger.debug("Context updated", { socketId, data });

    const conversation = this.conversations[socketId];
    conversation.push({ role: "system", content: data.context });
  }
}
