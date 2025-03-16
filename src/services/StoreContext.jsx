import { createContext, useContext, useReducer } from "react";
import Cookies from "js-cookie";

// ✅ Lấy user từ cookie khi khởi tạo state
const getInitialState = () => {
  const user = Cookies.get("user");
  const role = Cookies.get("role");

  return user && role ? { user: JSON.parse(user), role } : { user: null, role: "" };
};

// Định nghĩa reducer để xử lý state
function reducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      Cookies.set("user", JSON.stringify(action.payload.user), {
        expires: 1,
        secure: true,
        sameSite: "Lax",
      });

      Cookies.set("role", action.payload.role, {
        expires: 1,
        secure: true,
        sameSite: "Lax",
      });

      return { user: action.payload.user, role: action.payload.role };

    case "LOGOUT":
      // Xóa cookie khi logout
      Cookies.remove("user");
      Cookies.remove("role");
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");

      return { user: null, role: "" };

    default:
      return state;
  }
}

// Tạo context
const StoreContext = createContext();

// Component Provider để bọc toàn bộ ứng dụng
export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, getInitialState());

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

// Custom hook để sử dụng store
export function useStore() {
  return useContext(StoreContext);
}
