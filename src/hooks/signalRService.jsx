import * as signalR from "@microsoft/signalr";
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

class SignalRService {
  constructor() {
    this.connection = null;
    this.groupCallbacks = new Map(); // Lưu trữ callbacks theo group
    this.activeUsers = [];
    this.userCallbacks = [];
  }

  // Lắng nghe sự kiện toàn cục
  on = (eventName, callback) => {
    this.connection.on(eventName, callback);
  };
  
  // Hủy đăng ký sự kiện toàn cục
  off = (eventName, callback) => {
    this.connection.off(eventName, callback);
  };

  // Khởi tạo kết nối
  startConnection = async () => {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/monitoringHub`)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          return Math.min(retryContext.previousRetryCount * 2000, 10000);
        },
      })
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    try {
      await this.connection.start();
      console.log("SignalR Connected");
    } catch (err) {
      console.error("SignalR Connection Error:", err);
      throw err;
    }
  };

  // Tham gia group
  joinGroup = async (groupName) => {
    if (!this.connection) {
      throw new Error("Connection not established");
    }
    await this.connection.invoke("JoinGroup", groupName);
  };

  // Rời group
  leaveGroup = async (groupName) => {
    if (!this.connection) {
      throw new Error("Connection not established");
    }
    await this.connection.invoke("LeaveGroup", groupName);
    this.groupCallbacks.delete(groupName);
  };

  // Đăng ký lắng nghe sự kiện từ group
  onGroupMessage = (groupName, methodName, callback) => {
    if (!this.groupCallbacks.has(groupName)) {
      this.groupCallbacks.set(groupName, new Map());
    }

    const groupCallbacks = this.groupCallbacks.get(groupName);
    groupCallbacks.set(methodName, callback);

    this.connection.on(methodName, callback);
  };

  // Hủy đăng ký lắng nghe
  offGroupMessage = (groupName, methodName) => {
    if (this.groupCallbacks.has(groupName)) {
      const callback = this.groupCallbacks.get(groupName).get(methodName);
      if (callback) {
        this.connection.off(methodName, callback);
      }
    }
  };

  // Gửi message tới group
  sendToGroup = async (groupName, methodName, ...args) => {
    if (!this.connection) {
      throw new Error("Connection not established");
    }
    await this.connection.invoke("SendToGroup", groupName, methodName, ...args);
  };

  // Đăng ký lắng nghe sự kiện user connected/disconnected
  subscribeToUserEvents = (callback) => {
    this.userCallbacks.push(callback);

    this.connection.on("UserConnected", (userInfo) => {
      this.activeUsers.push(userInfo);
      callback(this.activeUsers);
    });

    this.connection.on("UserDisconnected", (userInfo) => {
      this.activeUsers = this.activeUsers.filter((u) => u.connectionId !== userInfo.connectionId);
      callback(this.activeUsers);
    });
  };

  // Hủy đăng ký
  unsubscribeFromUserEvents = (callback) => {
    this.userCallbacks = this.userCallbacks.filter((cb) => cb !== callback);
    this.connection.off("UserConnected");
    this.connection.off("UserDisconnected");
  };

  // Lấy danh sách user đang kết nối
  fetchActiveUsers = async () => {
    if (!this.connection) return [];

    try {
      this.activeUsers = await this.connection.invoke("GetAllActiveUsers");
      return this.activeUsers;
    } catch (err) {
      console.error("Failed to fetch active users:", err);
      return [];
    }
  };
}

// Export singleton instance
const signalRService = new SignalRService();
export default signalRService;
