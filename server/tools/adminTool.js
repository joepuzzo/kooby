import { getConversationCache } from "../cache.js";
import { clearKoobyConversationCache } from "../functions/clearConversationCache.js";
import { countKoobyConversations } from "../functions/countConversations.js";
import { Tool } from "./tool.js";

export class AdminTool extends Tool {
  constructor() {
    super({
      name: "admin",
      description:
        "Server administration. Only use when the user explicitly asks for maintenance actions.",
    });

    this.defineFunction({
      name: "clear_conversation_cache",
      description:
        "Remove all Kooby conversation data from the server cache (every active chat session). Destructive; use only when the user asks to clear the cache or similar.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
      handler: async () => {
        const cache = getConversationCache();
        const { deleted, pattern } = await clearKoobyConversationCache(cache);
        return { deleted, pattern };
      },
    });

    this.defineFunction({
      name: "count_conversations",
      description:
        "Return how many Kooby conversation sessions are stored in the server cache (cached chats). Read-only.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
      handler: async () => {
        const cache = getConversationCache();
        const { count, pattern } = await countKoobyConversations(cache);
        return { count, pattern };
      },
    });
  }
}
