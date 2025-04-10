import axiosClient from "./axiosClient";

export const uploadFile = async (file, sessionId, type) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("sessionId", sessionId);
  formData.append("type", type);

  try {
    const response = await axiosClient.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data; // { fileName, sessionId, type, url }
  } catch (error) {
    throw new Error("Upload thất bại");
  }
};
