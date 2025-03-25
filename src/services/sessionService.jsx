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
      message: error.response?.data?.message || error.response?.data?.message || error.message || "Request failed!",
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

    if (error.response?.status === 404) {
      return null;
    }

    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Request failed!",
    };
  }
};

export const getSessionByStudentId = async (studentId) => {
  try {
    const response = await axiosClient.get(`student/student-schedule/${studentId}`);

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

export const getSessionByLecturerId = async (lecturerId) => {
  try {
    const response = await axiosClient.get(`/Lecturer/Session/lecturer-schedule/${lecturerId}`);

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Request failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.response?.data?.message || error.message || "Request failed!",
      // message: error.response?.data?.message || error.response?.data?.message || error.message || "Request failed!",
    };
  }
};

export const getSessionsByClassId = async (classId) => {
  try {
    const response = await axiosClient.get(`/Lecturer/Session/class/${classId}`);

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Request failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.response?.data?.message || error.message || "Request failed!",
    };
  }
};
