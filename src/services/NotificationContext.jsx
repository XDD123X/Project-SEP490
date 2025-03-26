import { createContext, useState, useEffect } from "react";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [readStatus, setReadStatus] = useState({});

  useEffect(() => {
    // Load trạng thái đã đọc từ localStorage
    const savedReadStatus = localStorage.getItem("notificationReadStatus");
    if (savedReadStatus) {
      setReadStatus(JSON.parse(savedReadStatus) || {});
    }
  }, []);

  // Cập nhật trạng thái đã đọc
  const markAsRead = (notificationId) => {
    // Update read status state
    const updatedReadStatus = { ...readStatus, [notificationId]: true };
    setReadStatus(updatedReadStatus);

    // Save to localStorage
    localStorage.setItem("notificationReadStatus", JSON.stringify(updatedReadStatus));
  };

  const markAllAsRead = (category, notifications) => {
    if (!notifications[category]) return; // Tránh lỗi nếu category không tồn tại

    const updatedReadStatus = { ...readStatus };

    notifications[category].forEach((notification) => {
      updatedReadStatus[notification.notificationId] = true;
    });

    setReadStatus(updatedReadStatus);
    localStorage.setItem("notificationReadStatus", JSON.stringify(updatedReadStatus));
  };

  return <NotificationContext.Provider value={{ readStatus, markAsRead, markAllAsRead }}>{children}</NotificationContext.Provider>;
};
