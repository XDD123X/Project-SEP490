// Mock user state for role-based access control
export const userState = {
  user: {
    id: "current-user-id",
    name: "Current User",
    email: "user@example.com",
  },
  role: "admin", // Can be 'admin', 'officer', or 'student'
};

// Function to check if user can edit courses
export function canEditCourses() {
  return userState.role !== "student";
}

// Function to update user role (for demo purposes)
export function setUserRole(role) {
  userState.role = role;
}
