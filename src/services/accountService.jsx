import axiosClient from "./axiosClient";

export const getStudentList = async () => {
  try {
    const response = await axiosClient.get("/officer/account/students");

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Request failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.message || "Request failed!",
    };
  }
};

export const getOfficerList = async () => {
    try {
      const response = await axiosClient.get("/officer/account/Officers");
  
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      console.error("Request failed:", error);
  
      return {
        status: error.response?.status || 500,
        message: error.message || "Request failed!",
      };
    }
  };

  export const getLecturerList = async () => {
    try {
      const response = await axiosClient.get("/officer/account/Lecturers");
  
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      console.error("Request failed:", error);
  
      return {
        status: error.response?.status || 500,
        message: error.message || "Request failed!",
      };
    }
  };
