import axiosClient from "./axiosClient";

export const getAllCourse = async () => {
  try {
    const response = await axiosClient.get("/Course/course-list");

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Request failed:", error);

    if (error.response?.status === 404) {
      return null;
    }

    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Request failed!",
    };
  }
};

export const getCoursesOfficer = async () => {
  try {
    const response = await axiosClient.get("/officer/course");
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Request failed:", error);

    if (error.response?.status === 404) {
      return null;
    }

    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Request failed!",
    };
  }
};

export const getCourseByIdOfficer = async (courseId) => {
  try {
    const response = await axiosClient.get(`/officer/course/${courseId}`);
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Request failed:", error);

    if (error.response?.status === 404) {
      return null;
    }

    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Request failed!",
    };
  }
};

export const checkUsageByCourseId = async (courseId) => {
  try {
    const response = await axiosClient.get(`/officer/course/check-usage/${courseId}`);
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Request failed:", error);

    if (error.response?.status === 404) {
      return null;
    }

    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Request failed!",
    };
  }
};

export const addCourseOfficer = async (course) => {
  try {
    const response = await axiosClient.post(`/officer/course/add`, course);
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Request failed:", error);

    if (error.response?.status === 404) {
      return null;
    }

    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Request failed!",
    };
  }
};

export const updateCourseOfficer = async (courseId, updatedCourse) => {
  try {
    const response = await axiosClient.put(`/officer/course/edit/${courseId}`, updatedCourse);
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

export const updateCourseStatusOfficer = async (courseId, updatedCourse) => {
  try {
    const response = await axiosClient.put(`/officer/course/edit-status/${courseId}`, updatedCourse);

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

export const deleteCourseByIdOfficer = async (courseId) => {
  try {
    const response = await axiosClient.delete(`/officer/course/delete/${courseId}`);
    return {
      status: response.status,
      message: "Deleted successfully",
    };
  } catch (error) {
    console.error("Delete request failed:", error);

    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.response?.data?.message || error.message || "Request failed!",
    };
  }
};