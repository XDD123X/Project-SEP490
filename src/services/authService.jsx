import Cookies from "js-cookie";
import axiosClient, { setAccessToken, handleLogout } from "./axiosClient";
import { toast } from "sonner";

// 🔑 Gửi yêu cầu đăng nhập
export const login = async (email, password, rememberMe) => {
  try {
    // Gửi yêu cầu login
    const response = await axiosClient.post("/auth/login", { email, password, rememberMe });

    // Kiểm tra xem có accessToken hay không
    if (!response.data?.accessToken) {
      return {
        status: 400,
        data: "Login response is invalid. Please try again.",
      };
    }

    // Lưu token
    setAccessToken(response.data.accessToken);

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data?.message || "An error occurred.";

      if (status === 404) {
        return {
          status: 404,
          data: "Invalid Email Or Password. Please Try Again.",
        };
      }

      if (status >= 500) {
        return {
          status: status,
          data: errorMessage, // Trả về thông báo lỗi từ server nếu có
        };
      }

      return {
        status: status,
        data: errorMessage,
      };
    }

    return {
      status: 500,
      data: "Network error! Please check your connection.",
    };
  }
};

// 🔒 Gửi yêu cầu logout
export const logout = async () => {
  try {
    const response = await axiosClient.post("/auth/logout", {}, { withCredentials: true });

    console.log(response.data.message); // "Logged out successfully"
    // Chuyển hướng về trang đăng nhập
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout failed", error);
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
    toast.error("Get User Failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message?.message || error.message || "Get User Failed!",
    };
  }
};

export const updateProfile = async (fullName, phone, dob, imgUrl, meetUrl) => {
  try {
    const response = await axiosClient.put("/auth/profile", {
      fullName,
      phone,
      dob,
      imgUrl,
      meetUrl,
    });

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    toast.error("Update Profile Failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message?.message || error.message || "Update Profile Failed!",
    };
  }
};

export const changePassword = async (oldPassword, newPassword, reNewPassword) => {
  try {
    const response = await axiosClient.post("/auth/change-password", {
      oldPassword,
      newPassword,
      reNewPassword,
    });

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message?.message || error.message || "Change Password Failed!",
    };
  }
};

export const changePasswordFirstTime = async (oldPassword = "", newPassword, reNewPassword) => {
  try {
    const response = await axiosClient.post("/auth/first-time-login", {
      oldPassword,
      newPassword,
      reNewPassword,
    });

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message?.message || error.message || "Change Password Failed!",
    };
  }
};

export const updateAvatar = async (fullName, phone, dob, imgUrl) => {
  try {
    const response = await axiosClient.put("/auth/avatar", {
      fullName,
      phone,
      dob,
      imgUrl,
    });

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message?.message || error.message || "Update Profile Failed!",
    };
  }
};

export const requestOtp = async (email) => {
  try {
    const response = await axiosClient.post(`/auth/request-otp/${email}`);

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message?.message || error.message || "Request Failed!",
    };
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const response = await axiosClient.post(`/auth/verify-otp/${email}/${otp}`);

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message?.message || error.message || "Request Failed!",
    };
  }
};

export const forgotPassword = async (requestModel) => {
  try {
    const response = await axiosClient.post(`auth/forgot-password`, requestModel);

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Request Failed!",
    };
  }
};

export const loginWithGoogleEmail = async (email) => {
  try {
    // Gửi email lên backend dưới dạng JSON
    const response = await axiosClient.post("/auth/google-login", email);

    // Lưu accessToken vào storage
    setAccessToken(response.data.accessToken);

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Login failed!";

      if (status === 400) {
        return { status, data: "Email cannot be empty." };
      } else if (status === 401) {
        return { status, data: "No account found with this email." };
      } else if (status === 403) {
        return { status, data: "Your account has been suspended." };
      } else if (status === 500) {
        return { status, data: "Server error! Please try again later." };
      } else {
        return { status, data: message };
      }
    }

    return {
      status: 500,
      data: "Network error! Please check your connection.",
    };
  }
};
