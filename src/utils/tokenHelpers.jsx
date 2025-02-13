import React from "react";
import { jwtDecode } from "jwt-decode";

export const getRoleFromToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.role;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

export const getUserFromToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.sub;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};
