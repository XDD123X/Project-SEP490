import Cookies from "js-cookie";
import axiosClient, { setAccessToken, handleLogout } from "./axiosClient";
import { toast } from "sonner";

// 🔑 Gửi yêu cầu đăng nhập
export const login = async (email, password, rememberMe) => {
  try {
    // Gửi yêu cầu login
    const response = await axiosClient.post("/auth/login", { email, password, rememberMe });
    setAccessToken(response.data.accessToken);
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        return {
          status: 404,
          data: "Invalid Email Or Password. Please Try Again.",
        };
      } else if (error.response.status >= 500) {
        return {
          status: error.response.status,
          data: "Server error! Please try again later.",
        };
      } else {
        return {
          status: error.response.status,
          data: error.response.data?.message || "Login failed!",
        };
      }
    }

    return {
      status: 500,
      data: "Network error! Please check your connection.",
    };
  }
};

// 🔒 Gửi yêu cầu logout
export const logout = async () => {
  const user = localStorage.getItem("user");

  if (!user) {
    toast.error("User not found!");
    return;
  }

  try {
    const jsonUser = JSON.parse(user);
    const uid = jsonUser.uid;

    await axiosClient.post("/auth/logout", { uid });
    handleLogout();
  } catch (error) {
    toast.error("Logout failed:", error);
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
      message: error.message || "Get User Failed!",
    };
  }
};

export const updateProfile = async (fullName, phone, dob, imgUrl) => {
  try {
    const response = await axiosClient.put("/auth/profile", {
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
    toast.error("Update Profile Failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.response?.data || "Update Profile Failed!",
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
    toast.error("Change Password Failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.response?.data || "Change Password Failed!",
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
    toast.error("Update Profile Failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.response?.data || "Update Profile Failed!",
    };
  }
};
