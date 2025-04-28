import React, { createContext, useContext, useEffect, useState } from "react";
import signalRService from "./signalRService";

const SignalRContext = createContext();

export const SignalRProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);

  // Khởi tạo kết nối khi provider mount
  useEffect(() => {
    const startConnection = async () => {
      try {
        await signalRService.startConnection();
        setIsConnected(true);
      } catch (err) {
        console.error("Failed to start SignalR connection:", err);
      }
    };

    startConnection();

    return () => {
      // Cleanup khi unmount (nếu cần)
      if (signalRService.connection) {
        signalRService.connection.stop();
      }
    };
  }, []);

  return <SignalRContext.Provider value={{ isConnected }}>{children}</SignalRContext.Provider>;
};

// Custom hook để sử dụng SignalR
export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error("useSignalR must be used within a SignalRProvider");
  }
  return { ...context, signalRService };
};
