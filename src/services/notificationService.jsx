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
