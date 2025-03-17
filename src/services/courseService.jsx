import axiosClient from "./axiosClient";


export const getAllCourse = async () => {
  try {
    const response = await axiosClient.get("/Course/course-list");

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Request failed:", error);

    if (error.response?.status === 404) {
      return null;
    }

    return {
      status: error.response?.status || 500,
      message: error.message || "Request failed!",
    };
  }
};


