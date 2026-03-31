export class ChatManagerBase {
  constructor({ url, onMessage, onOpen, onClose, onError, authToken }) {
    if (new.target === ChatManagerBase) {
      throw new TypeError("Cannot construct ChatManagerBase instances directly");
    }
    this.url = url;
    this.onMessage = onMessage;
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.onError = onError;
    this.authToken = authToken;
  }

  // Abstract methods that must be implemented by subclasses
  connect(callback) {
    throw new Error("connect method must be implemented by subclass");
  }

  sendMessage(message) {
    throw new Error("sendMessage method must be implemented by subclass");
  }

  disconnect() {
    throw new Error("disconnect method must be implemented by subclass");
  }
}