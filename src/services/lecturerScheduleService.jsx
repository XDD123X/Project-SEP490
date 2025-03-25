import axiosClient from "./axiosClient";

export const getAllLecturerSchedule = async () => {
  try {
    const response = await axiosClient.get("/lecturer/LecturerSchedule/all");

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

export const getLecturerScheduleById = async (scheduleId) => {
  try {
    const response = await axiosClient.get(`/lecturer/LecturerSchedule/id/${scheduleId}`);

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

export const getLecturerScheduleByLecturerId = async (lecturerId) => {
  try {
    const response = await axiosClient.get(`/lecturer/LecturerSchedule/lecturer/${lecturerId}`);

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

export const AddLecturerSchedule = async (lecturerSchedule) => {
  try {
    const response = await axiosClient.post(`/lecturer/LecturerSchedule/add`, lecturerSchedule);

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

export const UpdateLecturerSchedule = async (lecturerSchedule) => {
  try {
    const response = await axiosClient.put(`/lecturer/LecturerSchedule/update/${lecturerSchedule.scheduleId}`, lecturerSchedule);

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
