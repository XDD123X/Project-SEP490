import axiosClient from "./axiosClient";

export const getRoleList = async () => {
  try {
    const response = await axiosClient.get("/Role");

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Request failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Request failed!",
    };
  }
};
