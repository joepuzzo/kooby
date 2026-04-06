import { ChatManagerBase } from "./ChatManagerBase.js";

export class WSChatManager extends ChatManagerBase {
  constructor({ url, onMessage, onOpen, onClose, onError, authToken, agent }) {
    // Format WebSocket URL with optional token
    let wsUrl = url;
    if (authToken) {
      wsUrl += `?token=${authToken}`;
    }

    super({ url: wsUrl, onMessage, onOpen, onClose, onError, authToken });
    this.socket = null;
  }

  connect(cb) {
    this.socket = new WebSocket(this.url);

    // Call the on Open and optional callback
    this.socket.onopen = () => {
      this.onOpen();
      // Optional callback after connection is established
      if (cb) cb();
    };
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.onMessage(data);
    };
    this.socket.onclose = this.onClose;
    this.socket.onerror = this.onError;
  }

  isOpen() {
    return Boolean(this.socket && this.socket.readyState === WebSocket.OPEN);
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not open");
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}
