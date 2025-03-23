import axiosClient from "./axiosClient";

/**
 * Get the last profile change request of the logged-in student.
 */
export const GetStudentLastRequest = async () => {
  try {
    const response = await axiosClient.get("/Student/Request/last");
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error("GetStudentLastRequest failed:", error);
    return handleRequestError(error);
  }
};

/**
 * Get all profile change requests (for officers/admins).
 */
export const GetAllRequest = async () => {
  try {
    const response = await axiosClient.get("/Officer/Request/all");
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error("GetAllRequest failed:", error);
    return handleRequestError(error);
  }
};

/**
 * Get all requests of the logged-in student.
 */
export const GetStudentRequests = async () => {
  try {
    const response = await axiosClient.get("/Officer/Request/student/all");
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error("GetStudentRequests failed:", error);
    return handleRequestError(error);
  }
};

/**
 * Get all requests related to lecturers (temporary endpoint).
 */
export const GetLecturerRequests = async () => {
  try {
    const response = await axiosClient.get("/Officer/Request/lecturer/all"); // Temporary endpoint
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error("GetLecturerRequests failed:", error);
    return handleRequestError(error);
  }
};

/**
 * Get requests by a specific lecturer ID (temporary endpoint).
 */
export const GetRequestByLecturerId = async (lecturerId) => {
  try {
    const response = await axiosClient.get(`/Officer/Request/lecturer/${lecturerId}`);
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error("GetRequestByLecturerId failed:", error);
    return handleRequestError(error);
  }
};

/**
 * Get profile change requests by a specific student ID.
 */
export const GetRequestByStudentId = async (studentId) => {
  try {
    const response = await axiosClient.get(`/Officer/Request/student/${studentId}`);
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error("GetRequestByStudentId failed:", error);
    return handleRequestError(error);
  }
};

/**
 * Submit a new profile change request for a student.
 */
export const AddStudentRequest = async (requestData) => {
  try {
    const response = await axiosClient.post("/Student/Request/add", requestData);
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error("AddStudentRequest failed:", error);
    return handleRequestError(error);
  }
};

/**
 * Submit a new profile change request for a lecturer (temporary endpoint).
 */
export const AddLecturerRequest = async (requestData) => {
  try {
    const response = await axiosClient.post("/Lecturer/Request/add", requestData); // Temporary endpoint
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error("AddLecturerRequest failed:", error);
    return handleRequestError(error);
  }
};

/**
 * Update an existing profile change request.
 */
export const UpdateRequest = async (updateData) => {
  try {
    const response = await axiosClient.put(`/Officer/Request/update`, updateData);
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error("UpdateRequest failed:", error);
    return handleRequestError(error);
  }
};

/**
 * Handle API request errors and return a formatted response.
 */
const handleRequestError = (error) => {
  return {
    status: error.response?.status || 500,
    message: error.response?.data?.message || error.message || "Request failed!",
  };
};
