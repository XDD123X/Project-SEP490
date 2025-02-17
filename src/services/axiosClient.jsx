import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { useStore } from "./StoreContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Tạo Axios instance
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Để trình duyệt gửi cookie httpOnly
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request Interceptor: Tự động gắn accessToken vào header
axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken(); // Lấy accessToken từ cookie
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor: Xử lý khi accessToken hết hạn
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Gửi yêu cầu để làm mới refreshToken (cookie tự động được gửi)
        const res = await axios.get(`${API_BASE_URL}/auth/refresh-token`, { withCredentials: true });

        const newAccessToken = res.data.accessToken;
        setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosClient(originalRequest); // Gửi lại request ban đầu
      } catch (refreshError) {
        toast.error("Session Expired, Please Login Again!");
        handleLogout();
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Hàm lưu accessToken vào cookie
export const setAccessToken = (token) => {
  Cookies.set("access_token", token, { expires: 1 / 40 });
};

// ✅ Hàm lấy accessToken từ cookie
export const getAccessToken = () => {
  return Cookies.get("access_token");
};

// ✅ Hàm logout (xoá accessToken và điều hướng về login)
export const handleLogout = () => {
  //accessToken = null;
  //Cookies.remove("refresh_token")
  //Cookies.remove("access_token");
  //sessionStorage.removeItem("user"); //
  //window.location.href = "/login"; // Điều hướng về trang login
};

export default axiosClient;
