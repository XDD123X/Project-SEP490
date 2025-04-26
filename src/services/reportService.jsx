import axiosClient from "./axiosClient";

export const getAllReport = async () => {
  try {
    const response = await axiosClient.get("/officer/report/getall");
    return response.data; // trả về danh sách report
  } catch (error) {
    console.log(error);
  }
};

export const analyzeSession = async (sessionId) => {
  try {
    const response = await axiosClient.post("/Lecturer/Report/Analyze", {
      sessionId,
    });
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Analyze failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Analyze failed!",
    };
  }
};

export const downloadReportDetail = async (sessionId) => {
  try {
    const response = await axiosClient.post(`/Officer/Report/GetReportBySessionIdUsingGeminiAi?sessionId=${sessionId}`, null, {
      responseType: "blob",
    });
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getSessionReporForLectureBySessionId = async (sessionId) => {
  try {
    const response = await axiosClient.get(`/lecturer/report/GetReportBySessionId?sessionId=${sessionId}`);
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

export const getSessionReporForOfficerBySessionId = async (sessionId) => {
  try {
    const response = await axiosClient.get(`/officer/report/GetReportBySessionId?sessionId=${sessionId}`);
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
