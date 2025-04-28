import * as signalR from "@microsoft/signalr";

class SignalRService {
  constructor() {
    this.connection = null;
    this.startPromise = null;
    this.subscribers = {};
  }

  startConnection = () => {
    if (!this.startPromise) {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:5000/monitoringHub", {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .configureLogging(signalR.LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      this.startPromise = this.connection
        .start()
        .then(() => {
          console.log("SignalR Connected!");
          return this.connection;
        })
        .catch((err) => {
          console.error("SignalR Connection Error: ", err);
          this.startPromise = null;
          throw err;
        });
    }
    return this.startPromise;
  };

  on = (methodName, callback) => {
    if (!this.subscribers[methodName]) {
      this.subscribers[methodName] = [];
    }
    this.subscribers[methodName].push(callback);

    // Nếu connection đã tồn tại, đăng ký ngay lập tức
    if (this.connection) {
      this.connection.on(methodName, callback);
    }
  };

  off = (methodName, callback) => {
    if (this.subscribers[methodName]) {
      this.subscribers[methodName] = this.subscribers[methodName].filter((cb) => cb !== callback);
    }
    if (this.connection) {
      this.connection.off(methodName, callback);
    }
  };

  invoke = (methodName, ...args) => {
    if (!this.connection) {
      return Promise.reject(new Error("Connection not established"));
    }
    return this.connection.invoke(methodName, ...args);
  };

  
}

// Export singleton instance
export default new SignalRService();
