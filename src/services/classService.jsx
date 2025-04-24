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
      message: error.response?.data?.message || error.message || "Request failed!",
    };
  }
};

export const GetClassById = async (classId) => {
  try {
    const response = await axiosClient.get(`/officer/class/${classId}`);
    const classItem = response.data;

    // Tìm class theo classId
    // const classItem = classList.find((cls) => cls.classId === classId);

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
      message: error.response?.data?.message || error.message || "Request failed!",
    };
  }
};

export const GetLecturerClassList = async () => {
  try {
    const response = await axiosClient.get("/Lecturer/Class/all");

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
export const GetLecturerClassById = async (classId) => {
  try {
    const response = await axiosClient.get(`/Lecturer/Class/${classId}`);
    const classItem = response.data;

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
      message: error.response?.data?.message || error.message || "Request failed!",
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
      message: error.response?.data?.message || error.message || "Request failed!",
    };
  }
};

export const AddClass = async (classItem) => {
  try {
    const response = await axiosClient.post(`/admin/Class/create`, classItem);

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Request failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Request failed!",
    };
  }
};

export const UpdateClass = async (classItem) => {
  try {
    const response = await axiosClient.put(`/officer/Class/update`, classItem);

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Request failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Request failed!",
    };
  }
};

export const AddStudentsToClass = async (jsonData) => {
  try {
    const response = await axiosClient.post("officer/Class/add-student", jsonData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const UpdateStudentsInClass = async (jsonData) => {
  try {
    const response = await axiosClient.post("officer/Class/update-student", jsonData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const TogglClassStudentStatus = async (classId, studentId) => {
  try {
    const response = await axiosClient.post(`lecturer/Class/report/${classId}/${studentId}`);
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
