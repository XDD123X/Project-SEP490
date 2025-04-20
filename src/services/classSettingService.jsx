import axiosClient from "./axiosClient";

// 🔑 Gửi yêu cầu đăng nhập
export const getCurrentSetting = async () => {
  try {
    const response = await axiosClient.get("/admin/ClassSetting/current");

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

export const getAllSetting = async () => {
  try {
    const response = await axiosClient.get("/admin/ClassSetting/all");

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

export const getSettingById = async (settingId) => {
  try {
    const response = await axiosClient.get(`/admin/ClassSetting/get/${settingId}`);

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

export const updateSetting = async (settingId, setting) => {
  try {
    const response = await axiosClient.put(`/admin/ClassSetting/edit/${settingId}`, setting);

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Request failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.response?.data || error.message || "Request failed!",
    };
  }
};
