import axiosClient from "./axiosClient";

export const AddAttendance = async (sessionId, students) => {
  try {
    const response = await axiosClient.post(
      `/Lecturer/Attendance/Add`,
      students,
      { params: { sessionId } } // Truyền sessionId qua query params
    );

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Error adding attendance:", error);
    throw error;
  }
};

export const UpdateAttendance = async (sessionId, students) => {
  try {
    const response = await axiosClient.put(`/Lecturer/Attendance/edit/${sessionId}`, students);

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Error adding attendance:", error);
    throw error;
  }
};
