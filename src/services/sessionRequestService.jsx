import axiosClient from "./axiosClient";

/**
 * Handle API request errors and return a formatted response.
 */
const handleRequestError = (error) => {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Request failed!",
    };
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
 * Update an existing profile change request.
 */
export const UpdateLecturerRequest = async (updateData) => {
  try {
    const response = await axiosClient.put(`/Officer/session-change`, updateData);
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error("UpdateRequest failed:", error);
    return handleRequestError(error);
  }
};