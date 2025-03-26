import axiosClient from "./axiosClient";

export const GetNotificationByAccount = () => {
  try {
    const response = axiosClient.get(`/Notification/Get`);
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
