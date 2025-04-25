import axiosClient from "./axiosClient";

export const getAccounts = async () => {
  try {
    const response = await axiosClient.get("/officer/account/all");

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
      message: error.response?.data?.message || error.message || "Request failed!",
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
      message: error.response?.data?.message || error.message || "Request failed!",
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
      message: error.response?.data?.message || error.message || "Request failed!",
    };
  }
};

export const importStudentList = async (students) => {
  try {
    const response = await axiosClient.post("/officer/account/add-list-student", students);

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Import failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Import students failed!",
    };
  }
};

export const importLecturerList = async (lecturers) => {
  try {
    const response = await axiosClient.post("/officer/account/add-list-lecturer", lecturers);

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Import failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Import lecturers failed!",
    };
  }
};

export const importOfficerList = async (officers) => {
  try {
    const response = await axiosClient.post("/admin/account/add-list-officer", officers);

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Import failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Import Officers failed!",
    };
  }
};

export const getAccountById = async (id) => {
  try {
    const response = await axiosClient.get(`/officer/account/${id}`);

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Request Failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Request Failed!",
    };
  }
};

export const updateAccount = async (account) => {
  try {
    const response = await axiosClient.put("/officer/account/update", account);

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Import failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Update Account failed!",
    };
  }
};

export const addAccount = async (account) => {
  try {
    const response = await axiosClient.post("/officer/account/add", account);

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Import failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Add Account failed!",
    };
  }
};

export const deleteAccountById = async (accountId) => {
  try {
    const response = await axiosClient.delete(`/admin/account/delete/${accountId}`);

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Import failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Add Account failed!",
    };
  }
};
