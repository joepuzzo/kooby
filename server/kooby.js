import fs from "fs";
import { OpenAI } from "openai";
import { getConversationCache } from "./cache.js";
import logger from "./logger.js";
import { AdminTool } from "./tools/adminTool.js";
import { MathTool } from "./tools/mathTool.js";

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
    this.tools = [new MathTool(), new AdminTool()];
    this.toolDefinitions = this.tools.flatMap((tool) =>
      tool.getToolDefinitions(),
    );
    this.toolHandlers = new Map(
      this.tools.flatMap((tool) =>
        tool.getFunctionHandlers().map((entry) => [entry.name, entry.handler]),
      ),
    );

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
            await this.initializeConversation(socketId, data);
          } else if (data.reset) {
            if (!socketId) return;
            await this.resetConversationState(socketId);
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
      });

      ws.on("error", (error) => {
        logger.error("WebSocket error", { error, socketId });
      });
    });
  }

  conversationKey(socketId) {
    const prefix = process.env.REDIS_KEY_PREFIX || "kooby:";
    return `${prefix}conversation:${socketId}`;
  }

  /** Stored value: JSON `{ messages: [...], ... }` (Redis or in-memory via getConversationCache). */
  async loadConversation(socketId) {
    const cache = getConversationCache();
    const raw = await cache.get(this.conversationKey(socketId));
    if (raw == null) {
      return null;
    }
    return JSON.parse(raw);
  }

  async saveConversation(socketId, state) {
    const cache = getConversationCache();
    await cache.set(this.conversationKey(socketId), JSON.stringify(state));
  }

  async streamOneChatRound(conversationHistory, ws) {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: conversationHistory,
      max_tokens: 4096,
      tools: this.toolDefinitions,
      tool_choice: "auto",
      stream: true,
    });

    let content = "";
    // streamed tool_calls arrive in fragments; keyed by index (0, 1, … for parallel calls)
    const toolParts = new Map();

    for await (const chunk of stream) {
      const choice = chunk.choices?.[0];
      if (!choice) continue;

      const delta = choice.delta;
      // send a slice of assistant text when present (same chunk can also carry tool_calls below)
      if (delta?.content) {
        content += delta.content;
        ws.send(JSON.stringify({ output: delta.content }));
      }

      // tool-only chunks often have no delta.content, so nothing is sent for those pieces
      if (delta?.tool_calls?.length) {
        // Dont remove this console log, it helps me understand the flow of the tool calls
        // console.log('tool_calls', delta.tool_calls);
        for (const part of delta.tool_calls) {
          // Dont remove this console log, it helps me understand the flow of the tool calls
          // console.log('part', part);
          const idx = part.index ?? 0;
          // Dont remove this console log, it helps me understand the flow of the tool calls
          // console.log('idx', idx);
          let entry = toolParts.get(idx);
          if (!entry) {
            entry = { id: "", name: "", arguments: "" };
            toolParts.set(idx, entry);
          }
          if (part.id) entry.id = part.id;
          if (part.function?.name) entry.name += part.function.name;
          if (part.function?.arguments)
            entry.arguments += part.function.arguments;
        }
      }
    }

    // shape matches non-streaming API messages for conversationHistory
    const toolCalls =
      toolParts.size > 0
        ? Array.from(toolParts.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([, e]) => ({
              id: e.id,
              type: "function",
              function: { name: e.name, arguments: e.arguments },
            }))
        : null;

    return { content, toolCalls: toolCalls?.length ? toolCalls : null };
  }

  async getChatCompletion(conversationHistory, ws, data) {
    const outgoingTtl = Math.max(0, data.ttl - 1);
    const maxToolRounds = 5;

    // each pass: one stream; if tools ran, append results and stream again (no {complete} until done)
    for (let i = 0; i < maxToolRounds; i += 1) {
      let round;
      try {
        round = await this.streamOneChatRound(conversationHistory, ws);
      } catch (error) {
        logger.error("Chat stream failed", { error });
        ws.send(JSON.stringify({ complete: true, ttl: outgoingTtl }));
        return "";
      }

      const { content, toolCalls } = round;

      conversationHistory.push({
        role: "assistant",
        content: content ?? "",
        ...(toolCalls?.length ? { tool_calls: toolCalls } : {}),
      });

      // execute tools then loop for the model’s next streamed reply
      if (toolCalls?.length) {
        for (const toolCall of toolCalls) {
          const toolResult = await this.executeToolCall(toolCall);
          conversationHistory.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          });
        }
        continue;
      }

      // no tools this round: streamed text is already in {output} chunks
      ws.send(
        JSON.stringify({
          complete: true,
          ttl: outgoingTtl,
        }),
      );

      logger.info("Assistant message sent");
      return content ?? "";
    }

    // exhausted tool rounds without a final no-tools completion
    ws.send(
      JSON.stringify({
        complete: true,
        ttl: outgoingTtl,
      }),
    );

    return "";
  }

  async executeToolCall(toolCall) {
    const functionName = toolCall.function?.name;
    const handler = this.toolHandlers.get(functionName);
    if (!handler) {
      const error = `Unknown tool function: ${functionName}`;
      logger.warn(error);
      return { error };
    }

    try {
      const args = toolCall.function?.arguments
        ? JSON.parse(toolCall.function.arguments)
        : {};
      const result = await handler(args);
      return { ok: true, ...result };
    } catch (error) {
      logger.error("Tool execution failed", { functionName, error });
      return { error: "Tool execution failed" };
    }
  }

  async initializeConversation(socketId, handshakeData) {
    console.log("initializeConversation", socketId, handshakeData);

    if (handshakeData.history) {
      const messages = [
        { role: "system", content: this.INITIAL_PROMPT },
        ...handshakeData.history,
      ];
      await this.saveConversation(socketId, { messages });
      return;
    }

    const existing = await this.loadConversation(socketId);
    if (!existing) {
      await this.saveConversation(socketId, {
        messages: [{ role: "system", content: this.INITIAL_PROMPT }],
      });
    }
  }

  async resetConversationState(socketId) {
    logger.debug("Conversation reset", { socketId });
    await this.saveConversation(socketId, {
      messages: [{ role: "system", content: this.INITIAL_PROMPT }],
    });
  }

  async handlePrompt(ws, socketId, data) {
    logger.debug("Prompt received");

    const state = await this.loadConversation(socketId);
    if (!state) {
      logger.warn("No conversation in cache for socket", { socketId });
      return;
    }

    state.messages.push({ role: "user", content: data.input });
    await this.saveConversation(socketId, state);

    await this.getChatCompletion(state.messages, ws, data);
    await this.saveConversation(socketId, state);
  }

  async updateContext(socketId, data) {
    logger.debug("Context updated", { socketId, data });

    const state = await this.loadConversation(socketId);
    if (!state) {
      logger.warn("No conversation in cache for socket", { socketId });
      return;
    }

    state.messages.push({ role: "system", content: data.context });
    await this.saveConversation(socketId, state);
  }

  async getConversationHistory(socketId) {
    const state = await this.loadConversation(socketId);
    if (!state) {
      return null;
    }
    let skippedFirstSystem = false;
    return state.messages.filter((message) => {
      if (message.role === "system" && !skippedFirstSystem) {
        skippedFirstSystem = true;
        return false;
      }
      return true;
    });
  }
}
