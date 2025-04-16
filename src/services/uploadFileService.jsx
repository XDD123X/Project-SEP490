import axiosClient from "./axiosClient";

export const uploadFile = async (file, classId, sessionId, type, onProgress = () => {}) => {
  const formData = new FormData();
  formData.append("File", file);
  formData.append("SessionId", sessionId);
  formData.append("Type", type);

  try {
    const response = await axiosClient.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (typeof onProgress === "function") {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return response.data; // { fileName, sessionId, type, url }
  } catch (error) {
    throw new Error("Upload thất bại", error);
  }
};
