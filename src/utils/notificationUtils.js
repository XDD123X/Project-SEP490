// Helper functions for notifications

// Function to save read status to localStorage
export function saveReadStatus(notificationId, read = true) {
  const savedReadStatus = localStorage.getItem("notificationReadStatus") ? JSON.parse(localStorage.getItem("notificationReadStatus") || "{}") : {};

  savedReadStatus[notificationId] = read;
  localStorage.setItem("notificationReadStatus", JSON.stringify(savedReadStatus));
}

// Function to get read status from localStorage
export function getReadStatus(notificationId) {
  const savedReadStatus = localStorage.getItem("notificationReadStatus") ? JSON.parse(localStorage.getItem("notificationReadStatus") || "{}") : {};

  return savedReadStatus[notificationId] || false;
}

// Function to mark all notifications in a category as read
export function markAllAsRead(notifications) {
  const savedReadStatus = localStorage.getItem("notificationReadStatus") ? JSON.parse(localStorage.getItem("notificationReadStatus") || "{}") : {};

  notifications.forEach((notification) => {
    savedReadStatus[notification.id] = true;
  });

  localStorage.setItem("notificationReadStatus", JSON.stringify(savedReadStatus));
  return savedReadStatus;
}

// Parse CSV data
export function parseCSV(csvText) {
  const rows = csvText.split("\n");
  const headers = rows[0].split(",");

  // Skip header row
  return rows
    .slice(1)
    .map((row) => {
      const values = row.split(",");
      return {
        email: values[0]?.trim(),
        name: values[1]?.trim(),
      };
    })
    .filter((item) => item.email && item.name);
}

// Generate CSV template
export function generateCSVTemplate() {
  const headers = "email,name";
  const csvContent = `data:text/csv;charset=utf-8,${headers}`;
  return csvContent;
}

// Clear all read statuses from localStorage
export function clearAllReadStatus() {
  localStorage.removeItem("notificationReadStatus");
}

// Get all notifications that have been read
export function getAllReadNotifications() {
  const savedReadStatus = localStorage.getItem("notificationReadStatus") ? JSON.parse(localStorage.getItem("notificationReadStatus") || "{}") : {};

  return Object.keys(savedReadStatus)
    .filter((id) => savedReadStatus[id] === true)
    .map((id) => Number.parseInt(id));
}

// Get all read statuses
export function getAllReadStatuses() {
  return localStorage.getItem("notificationReadStatus") ? JSON.parse(localStorage.getItem("notificationReadStatus") || "{}") : {};
}
