import axiosClient from "./axiosClient";

export const generateSession = async (request) => {
  try {
    const response = await axiosClient.post("/Session/generate-schedule", request);

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Request failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.message || "Request failed!",
    };
  }
};

export const getAllSession = async () => {
  try {
    const response = await axiosClient.get("/Session/All");

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Request failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.message || "Request failed!",
    };
  }
};
