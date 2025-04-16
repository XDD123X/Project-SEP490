import axiosClient from "./axiosClient";

export const getAllReport = async () => {
  try {
    const response = await axiosClient.get("/officer/report/getall");
    return response.data; // trả về danh sách report
  } catch (error) {
    console.log(error);
  }
};

export const analyzeSession = async (sessionId, generateBy) => {
  try {
    const response = await axiosClient.post("/Officer/Report/Analyze", {
      sessionId,
      generateBy,
    });
    return response.data; // kết quả phân tích
  } catch (error) {
    console.log(error);
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
