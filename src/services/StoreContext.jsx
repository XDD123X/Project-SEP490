import { createContext, useContext, useReducer } from "react";

// ✅ Lấy user từ sessionStorage khi khởi tạo state
const getInitialState = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const role = sessionStorage.getItem("role");
  return user && role ? { user, role } : { user: null, role: "" };
};

// Định nghĩa reducer để xử lý state
function reducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      sessionStorage.setItem("user", JSON.stringify(action.payload.user));
      sessionStorage.setItem("role", action.payload.role);
      return { user: action.payload.user, role: action.payload.role };

    case "LOGOUT":
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
  const [state, dispatch] = useReducer(reducer, getInitialState());

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
