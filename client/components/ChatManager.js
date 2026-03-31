import { WSChatManager } from "./WSChatManager.js";

export class ChatManager {
  static create({
    url,
    onMessage,
    onOpen,
    onClose,
    onError,
    authToken,
    agent,
  }) {
    if (url.startsWith("ws://") || url.startsWith("wss://")) {
      return new WSChatManager({
        url,
        onMessage,
        onOpen,
        onClose,
        onError,
        authToken,
        agent,
      });
    }
    throw new Error(
      `Kooby expects a WebSocket URL (ws:// or wss://). Got: ${url}`,
    );
  }
}
