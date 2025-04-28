// Tạo file SignalRContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import signalRService from "./signalRService";

const SignalRContext = createContext();

export const SignalRProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    const startConnection = async () => {
      try {
        const conn = await signalRService.startConnection();
        setConnection(conn);
      } catch (err) {
        console.error("Failed to start SignalR connection:", err);
      }
    };

    startConnection();

    return () => {
      if (signalRService.connection) {
        signalRService.connection.stop();
      }
    };
  }, []);

  return <SignalRContext.Provider value={{ connection }}>{children}</SignalRContext.Provider>;
};

export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error("useSignalR must be used within a SignalRProvider");
  }
  return context;
};
