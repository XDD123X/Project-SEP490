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

export const getSessionBySessionId = async (sessionId) => {
  try {
    const response = await axiosClient.get(`/Lecturer/Session/${sessionId}`);

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

export const requestChangeSessionValid = async (lecturerId, newDate, newSlot, sessionId = null) => {
  try {
    const response = await axiosClient.get("/Lecturer/session-change/check-conflict", {
      params: { lecturerId, newDate, newSlot, sessionId },
    });

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

export const addSessionValid = async (classId, lecturerId, sessionDate, slot) => {
  try {
    const response = await axiosClient.get("/session/officer/check-conflict", {
      params: { classId, lecturerId, sessionDate, slot },
    });

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

export const addRequestChangeSession = async (requestChange) => {
  try {
    const response = await axiosClient.post("/Lecturer/session-change/add", requestChange);

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

export const deleteSession = async (sessionId) => {
  try {
    const response = await axiosClient.delete(`/Session/delete`, {
      data: JSON.stringify(sessionId), // 👈 Chuyển GUID thành JSON string
      headers: {
        "Content-Type": "application/json", // 👈 Bắt buộc có header này
      },
    });

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

export const addSingleSession = async (session) => {
  try {
    const response = await axiosClient.post("/session/officer/add-single-session", session);

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

export const updateSession = async (session) => {
  try {
    const response = await axiosClient.put("/Session/Update", session);

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
