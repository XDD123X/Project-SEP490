import axiosClient from "./axiosClient";

export const GetMyNotification = async () => {
  try {
    const response = await axiosClient.get(`/Notifications/Me`);
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Request failed!",
    };
  }
};

export const GetNotificationManagement = async (accountId) => {
  try {
    const response = await axiosClient.post(`/Notifications/List`, accountId);
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Request failed!",
    };
  }
};

export const GetNotificationById = async (notificationId) => {
  try {
    const response = await axiosClient.get(`/Notifications/${notificationId}`);
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Request failed!",
    };
  }
};

export const AddNotification = async (notification) => {
  try {
    const response = await axiosClient.post(`/Notifications/Add`, notification);
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Request failed!",
    };
  }
};

export const UpdateNotification = async (notification) => {
  try {
    const response = await axiosClient.put(`/Notifications/edit/${notification.notificationId}`, notification);
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Request failed!",
    };
  }
};

export const DeleteNotification = async (notificationId) => {
  try {
    const response = await axiosClient.delete(`/notifications/delete/${notificationId}`);
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Request failed!",
    };
  }
};
