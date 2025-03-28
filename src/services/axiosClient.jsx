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

    // ✅ Nếu request là đăng nhập và bị lỗi 401 → Trả về lỗi mà không refresh token
    if (originalRequest.url.includes("/auth/login") && error.response?.status === 401) {
      return Promise.reject(error); // Trả lỗi ngay, không thử refresh token
    }

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
  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + 30);
  Cookies.set("access_token", token, { expires: expiryDate, path: "/" });
};

// ✅ Hàm lấy accessToken từ cookie
export const getAccessToken = () => {
  return Cookies.get("access_token");
};

// ✅ Hàm logout (xoá accessToken và điều hướng về login)
export const handleLogout = () => {
  Cookies.remove("access_token", { path: "/" });
  Cookies.remove("refresh_token", { path: "/" });
  Cookies.remove("user", { path: "/" });
  Cookies.remove("role", { path: "/" });
  window.location.href = "/login"; // Điều hướng về trang login
};

export default axiosClient;
