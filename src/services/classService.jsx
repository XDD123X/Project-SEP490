import axiosClient from "./axiosClient";

export const GetClassList = async () => {
  try {
    const response = await axiosClient.get("/admin/Class/class-list");

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

export const GetClassListByStudentId = async (studentId) => {
  try {
    const response = await axiosClient.get(`/Student/student-class?studentId=${studentId}`);

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
