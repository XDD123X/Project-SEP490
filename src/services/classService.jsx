import axiosClient from "./axiosClient";

export const GetClassList = async () => {
  try {
    const response = await axiosClient.get("/officer/classes");

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

export const GetClassById = async (classId) => {
  try {
    const response = await axiosClient.get("/officer/classes");
    const classList = response.data;

    // Tìm class theo classId
    const classItem = classList.find((cls) => cls.classId === classId);

    if (!classItem) {
      return {
        status: 404,
        message: "Class not found!",
      };
    }

    return {
      status: response.status,
      data: classItem,
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
