import Cookies from "js-cookie";
import axiosClient, { setAccessToken, handleLogout } from "./axiosClient";

// 🔑 Gửi yêu cầu đăng nhập
export const login = async (email, password, rememberMe) => {
  try {
    // Gửi yêu cầu login
    const response = await axiosClient.post("/auth/login", { email, password, rememberMe });

    setAccessToken(response.data.accessToken); // Lưu accessToken vào RAM

    // Trả về toàn bộ response để có thể kiểm tra status ở các nơi khác
    return {
      status: response.status, // Trả về status HTTP
      data: response.data, // Trả về data từ API
    };
  } catch (error) {
    console.error("Login failed:", error);

    // Nếu có lỗi xảy ra, trả về status và message lỗi để kiểm tra sau
    return {
      status: error.response?.status || 500, // Nếu có lỗi phản hồi từ server, lấy status
      message: error.message || "Login failed!", // Lấy thông báo lỗi
    };
  }
};

// 🔒 Gửi yêu cầu logout
export const logout = async () => {
  const user = getUser();
  const uid = user.uid;
  try {
    await axiosClient.post("/auth/logout", { uid }); // API sẽ xóa refreshToken trên server
    handleLogout();
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

export const authMe = async () => {
  try {
    const response = await axiosClient.get("/auth/me");

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Get User Failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.message || "Get User Failed!",
    };
  }
};

export const getUser = () => {
  const user = sessionStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
