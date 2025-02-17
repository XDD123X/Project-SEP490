import { createContext, useContext, useReducer, useEffect } from "react";

// Khởi tạo state ban đầu
const initialState = {
  user: null,
  role: "",
};

// Định nghĩa reducer để xử lý state
function reducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      // Lưu thông tin người dùng vào sessionStorage
      sessionStorage.setItem("user", JSON.stringify(action.payload.user));
      sessionStorage.setItem("role", action.payload.role);
      return { ...state, user: action.payload.user, role: action.payload.role };

    case "LOGOUT":
      // Xóa thông tin người dùng khỏi sessionStorage
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("role");
      return { user: null, role: "" };

    default:
      return state;
  }
}

// Tạo context
const StoreContext = createContext();

// Component Provider để bọc toàn bộ ứng dụng
export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Sử dụng useEffect để lấy dữ liệu từ sessionStorage khi ứng dụng tải lại
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const role = sessionStorage.getItem("role");

    if (user && role) {
      dispatch({ type: "SET_USER", payload: { user, role } });
    }
  }, [dispatch]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

// Custom hook để sử dụng store
export function useStore() {
  return useContext(StoreContext);
}
